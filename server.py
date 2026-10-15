import os
import sys
import sqlite3
import json
import io
import csv
from datetime import datetime
from flask import Flask, request, jsonify, send_file, send_from_directory

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Check root or subdirectory for db
DB_PATH = os.path.join(BASE_DIR, "commodity_mis.db")
if not os.path.exists(DB_PATH) and os.path.exists(os.path.join(BASE_DIR, "NIaz Channa_2", "commodity_mis.db")):
    DB_PATH = os.path.join(BASE_DIR, "NIaz Channa_2", "commodity_mis.db")

app = Flask(__name__, static_folder=BASE_DIR, static_url_path="")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
    CREATE TABLE IF NOT EXISTS clients(
        id TEXT PRIMARY KEY,
        name TEXT,
        caste TEXT,
        mobile TEXT,
        address TEXT,
        village TEXT,
        is_seller INTEGER DEFAULT 0,
        is_purchaser INTEGER DEFAULT 0
    )
    """)
    cur.execute("PRAGMA table_info(clients)")
    cols = {row[1] for row in cur.fetchall()}
    if "caste" not in cols:
        cur.execute("ALTER TABLE clients ADD COLUMN caste TEXT")
    if "is_seller" not in cols:
        cur.execute("ALTER TABLE clients ADD COLUMN is_seller INTEGER DEFAULT 0")
    if "is_purchaser" not in cols:
        cur.execute("ALTER TABLE clients ADD COLUMN is_purchaser INTEGER DEFAULT 0")

    cur.execute("""
    CREATE TABLE IF NOT EXISTS transactions(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client TEXT,
        commodity TEXT,
        weight REAL,
        rate REAL,
        total REAL,
        paid REAL,
        balance REAL,
        vehicle TEXT,
        vehicle_number TEXT,
        kiraya REAL DEFAULT 0,
        kanta_charges REAL DEFAULT 0,
        loading REAL DEFAULT 0,
        unloading REAL DEFAULT 0,
        brokery REAL DEFAULT 0,
        other_expenses REAL DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now','localtime')),
        advance_payment REAL DEFAULT 0,
        gate_pass TEXT DEFAULT '',
        transaction_type TEXT DEFAULT 'Purchase',
        expense_payer TEXT DEFAULT 'Company'
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS client_payments(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client TEXT,
        direction TEXT,
        amount REAL,
        note TEXT,
        created_at TEXT DEFAULT (datetime('now','localtime')),
        payment_mode TEXT DEFAULT 'Cash'
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS bank_accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id TEXT,
        bank_name TEXT,
        account_number TEXT,
        account_title TEXT,
        FOREIGN KEY(client_id) REFERENCES clients(id)
    )
    """)
    conn.commit()
    conn.close()

init_db()

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
    return response

# Serve frontend
@app.route("/")
def index():
    return send_file(os.path.join(BASE_DIR, "index.html"))

@app.route("/<path:path>")
def static_proxy(path):
    file_path = os.path.join(BASE_DIR, path)
    if os.path.exists(file_path):
        return send_file(file_path)
    return jsonify({"error": "File not found"}), 404

# ----------------- STATS API -----------------
@app.route("/api/stats")
def get_stats():
    role = request.args.get("role", "All")
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT 
            COALESCE(SUM(CASE WHEN transaction_type = 'Sale' THEN total ELSE 0 END), 0) as sales_amt,
            COALESCE(SUM(CASE WHEN transaction_type = 'Purchase' THEN total ELSE 0 END), 0) as purch_amt,
            COALESCE(SUM(CASE WHEN expense_payer = 'Company' THEN (kiraya + kanta_charges + loading + unloading + brokery + other_expenses) ELSE 0 END), 0) as exp_company,
            COALESCE(SUM(CASE WHEN expense_payer = 'Client' THEN (kiraya + kanta_charges + loading + unloading + brokery + other_expenses) ELSE 0 END), 0) as exp_client,
            COALESCE(SUM(kiraya), 0) as total_kiraya,
            COALESCE(SUM(kanta_charges), 0) as total_kanta,
            COALESCE(SUM(loading), 0) as total_loading,
            COALESCE(SUM(unloading), 0) as total_unloading,
            COALESCE(SUM(brokery), 0) as total_brokery,
            COALESCE(SUM(other_expenses), 0) as total_other_exp
        FROM transactions
    """)
    t_row = dict(cur.fetchone())
    sales_amt = float(t_row["sales_amt"])
    purch_amt = float(t_row["purch_amt"])
    exp_comp = float(t_row["exp_company"])
    exp_client = float(t_row["exp_client"])
    total_expenses = exp_comp + exp_client

    # Total paid/received through transactions and client_payments
    cur.execute("""
        SELECT 
            (SELECT COALESCE(SUM(paid + advance_payment), 0) FROM transactions) +
            (SELECT COALESCE(SUM(CASE WHEN direction IN ('Pay to Seller', 'Receive from Purchaser') THEN amount 
                                      WHEN direction LIKE 'Refund%' THEN -amount ELSE 0 END), 0) FROM client_payments) as total_paid
    """)
    global_total_paid = float(cur.fetchone()[0] or 0)

    # Client counts
    cur.execute("SELECT COUNT(*) FROM clients")
    total_clients = cur.fetchone()[0] or 0
    cur.execute("SELECT COUNT(*) FROM clients WHERE is_seller = 1")
    total_sellers = cur.fetchone()[0] or 0
    cur.execute("SELECT COUNT(*) FROM clients WHERE is_purchaser = 1")
    total_purchasers = cur.fetchone()[0] or 0

    # Transactions count
    cur.execute("SELECT COUNT(*) FROM transactions")
    total_trans = cur.fetchone()[0] or 0
    cur.execute("SELECT COUNT(*) FROM transactions WHERE transaction_type = 'Purchase'")
    purchase_trans_count = cur.fetchone()[0] or 0
    cur.execute("SELECT COUNT(*) FROM transactions WHERE transaction_type = 'Sale'")
    sales_trans_count = cur.fetchone()[0] or 0

    # Unified Balances & Debtor/Creditor summary
    role_filter = ""
    if role == "Seller":
        role_filter = "WHERE is_seller = 1"
    elif role == "Purchaser":
        role_filter = "WHERE is_purchaser = 1"

    cur.execute(f"""
        SELECT 
            SUM(CASE WHEN net_due > 1 THEN 1 ELSE 0 END) as debit_count,
            SUM(CASE WHEN net_due < -1 THEN 1 ELSE 0 END) as credit_count,
            SUM(CASE WHEN ABS(net_due) <= 1 THEN 1 ELSE 0 END) as nodue_count,
            SUM(net_due) as total_net_due,
            SUM(CASE WHEN net_due > 0 THEN net_due ELSE 0 END) as total_receivable,
            SUM(CASE WHEN net_due < 0 THEN ABS(net_due) ELSE 0 END) as total_payable
        FROM (
            SELECT 
                c.name,
                (
                  COALESCE((SELECT SUM(balance) FROM transactions WHERE client = c.name AND transaction_type='Sale'), 0) -
                  COALESCE((SELECT SUM(balance) FROM transactions WHERE client = c.name AND transaction_type='Purchase'), 0) +
                  COALESCE((SELECT SUM(amount) FROM client_payments WHERE client = c.name AND (direction='Pay to Seller' OR direction='Refund to Purchaser')), 0) -
                  COALESCE((SELECT SUM(amount) FROM client_payments WHERE client = c.name AND (direction='Receive from Purchaser' OR direction='Refund from Seller')), 0)
                ) as net_due
            FROM clients c
            {role_filter}
        )
    """)
    bal_row = dict(cur.fetchone())

    # Net Profit: Gross Sales - Purchase Cost - Company Expenses
    gross_trading_profit = sales_amt - purch_amt
    total_profit = gross_trading_profit - exp_comp

    # Rich Stock & Commodity Profit Summary
    cur.execute("""
        SELECT commodity,
            COALESCE(SUM(CASE WHEN transaction_type='Purchase' THEN weight ELSE 0 END), 0) as purchased_kg,
            COALESCE(SUM(CASE WHEN transaction_type='Purchase' THEN total ELSE 0 END), 0) as purchased_amt,
            COALESCE(SUM(CASE WHEN transaction_type='Sale' THEN weight ELSE 0 END), 0) as sold_kg,
            COALESCE(SUM(CASE WHEN transaction_type='Sale' THEN total ELSE 0 END), 0) as sold_amt
        FROM transactions 
        WHERE commodity IS NOT NULL AND commodity != ''
        GROUP BY commodity 
        ORDER BY commodity
    """)
    stocks = []
    total_stock_value = 0.0
    for r in cur.fetchall():
        p_kg = float(r["purchased_kg"])
        p_amt = float(r["purchased_amt"])
        s_kg = float(r["sold_kg"])
        s_amt = float(r["sold_amt"])
        bal_kg = p_kg - s_kg

        avg_buy_per_kg = (p_amt / p_kg) if p_kg > 0 else 0
        avg_buy_per_maund = avg_buy_per_kg * 40.0
        avg_sell_per_kg = (s_amt / s_kg) if s_kg > 0 else 0
        avg_sell_per_maund = avg_sell_per_kg * 40.0

        item_stock_val = max(0, bal_kg * avg_buy_per_kg)
        total_stock_value += item_stock_val
        item_profit = s_amt - (s_kg * avg_buy_per_kg) if s_kg > 0 else 0

        stocks.append({
            "commodity": r["commodity"],
            "purchased_kg": p_kg,
            "purchased_maunds": round(p_kg / 40.0, 2),
            "purchased_amt": p_amt,
            "sold_kg": s_kg,
            "sold_maunds": round(s_kg / 40.0, 2),
            "sold_amt": s_amt,
            "stock_kg": round(bal_kg, 2),
            "stock_maunds": round(bal_kg / 40.0, 2),
            "stock_tons": round(bal_kg / 1000.0, 2),
            "avg_buy_maund": round(avg_buy_per_maund, 2),
            "avg_sell_maund": round(avg_sell_per_maund, 2),
            "stock_value": round(item_stock_val, 2),
            "profit": round(item_profit, 2)
        })

    conn.close()

    return jsonify({
        "sales_amt": sales_amt,
        "purch_amt": purch_amt,
        "gross_margin": gross_trading_profit,
        "total_stock_value": round(total_stock_value, 2),
        "exp_company": exp_comp,
        "exp_client": exp_client,
        "total_expenses": total_expenses,
        "expense_breakdown": {
            "kiraya": float(t_row["total_kiraya"]),
            "kanta": float(t_row["total_kanta"]),
            "loading": float(t_row["total_loading"]),
            "unloading": float(t_row["total_unloading"]),
            "brokery": float(t_row["total_brokery"]),
            "other": float(t_row["total_other_exp"])
        },
        "total_paid": global_total_paid,
        "total_profit": total_profit,
        "total_clients": total_clients,
        "total_sellers": total_sellers,
        "total_purchasers": total_purchasers,
        "total_trans": total_trans,
        "purchase_trans_count": purchase_trans_count,
        "sales_trans_count": sales_trans_count,
        "debit_clients": bal_row.get("debit_count") or 0,
        "credit_clients": bal_row.get("credit_count") or 0,
        "nodue_clients": bal_row.get("nodue_count") or 0,
        "net_due": float(bal_row.get("total_net_due") or 0),
        "total_receivable": float(bal_row.get("total_receivable") or 0),
        "total_payable": float(bal_row.get("total_payable") or 0),
        "stocks": stocks
    })

# ----------------- CLIENTS API -----------------
@app.route("/api/clients", methods=["GET", "POST"])
def clients():
    conn = get_db()
    cur = conn.cursor()

    if request.method == "POST":
        data = request.json
        client_id = str(data.get("id") or "").strip()
        name = str(data.get("name") or "").strip()
        caste = str(data.get("caste") or "").strip()
        mobile = str(data.get("mobile") or "").strip()
        address = str(data.get("address") or "").strip()
        village = str(data.get("village") or "").strip()
        is_seller = 1 if data.get("is_seller") else 0
        is_purchaser = 1 if data.get("is_purchaser") else 0

        if not name:
            return jsonify({"error": "Client name is required"}), 400

        # Auto-generate ID if empty
        if not client_id:
            cur.execute("SELECT MAX(CAST(id AS INTEGER)) FROM clients")
            max_id = cur.fetchone()[0]
            client_id = str((max_id or 0) + 1)

        # Check existing
        cur.execute("SELECT id FROM clients WHERE id = ?", (client_id,))
        if cur.fetchone():
            # Update existing
            cur.execute("""
                UPDATE clients SET name=?, caste=?, mobile=?, address=?, village=?, is_seller=?, is_purchaser=?
                WHERE id=?
            """, (name, caste, mobile, address, village, is_seller, is_purchaser, client_id))
        else:
            cur.execute("""
                INSERT INTO clients (id, name, caste, mobile, address, village, is_seller, is_purchaser)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (client_id, name, caste, mobile, address, village, is_seller, is_purchaser))

        # Save bank account if provided
        bank_name = str(data.get("bank_name") or "").strip()
        account_number = str(data.get("account_number") or "").strip()
        account_title = str(data.get("account_title") or "").strip()
        if bank_name or account_number:
            cur.execute("DELETE FROM bank_accounts WHERE client_id = ?", (client_id,))
            cur.execute("""
                INSERT INTO bank_accounts (client_id, bank_name, account_number, account_title)
                VALUES (?, ?, ?, ?)
            """, (client_id, bank_name, account_number, account_title))

        conn.commit()
        conn.close()
        return jsonify({"success": True, "id": client_id})

    # GET
    role = request.args.get("role", "All")
    search = request.args.get("search", "").strip()

    query = """
        SELECT c.*, b.bank_name, b.account_number, b.account_title,
        (
          COALESCE((SELECT SUM(balance) FROM transactions WHERE client = c.name AND transaction_type='Sale'), 0) -
          COALESCE((SELECT SUM(balance) FROM transactions WHERE client = c.name AND transaction_type='Purchase'), 0) +
          COALESCE((SELECT SUM(amount) FROM client_payments WHERE client = c.name AND (direction='Pay to Seller' OR direction='Refund to Purchaser')), 0) -
          COALESCE((SELECT SUM(amount) FROM client_payments WHERE client = c.name AND (direction='Receive from Purchaser' OR direction='Refund from Seller')), 0)
        ) as net_due
        FROM clients c
        LEFT JOIN bank_accounts b ON b.client_id = c.id
        WHERE 1=1
    """
    params = []

    if role == "Seller":
        query += " AND c.is_seller = 1"
    elif role == "Purchaser":
        query += " AND c.is_purchaser = 1"

    if search:
        query += " AND (c.name LIKE ? OR c.id LIKE ? OR c.caste LIKE ? OR c.mobile LIKE ? OR c.village LIKE ?)"
        wildcard = f"%{search}%"
        params.extend([wildcard, wildcard, wildcard, wildcard, wildcard])

    query += " ORDER BY CAST(c.id AS INTEGER) ASC, c.name ASC"
    cur.execute(query, params)
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return jsonify(rows)

@app.route("/api/clients/<client_id>", methods=["DELETE"])
def delete_client(client_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM bank_accounts WHERE client_id = ?", (client_id,))
    cur.execute("DELETE FROM clients WHERE id = ?", (client_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

# ----------------- TRANSACTIONS API -----------------
@app.route("/api/transactions", methods=["GET", "POST"])
def transactions():
    conn = get_db()
    cur = conn.cursor()

    if request.method == "POST":
        data = request.json
        txn_id = data.get("id")
        client = str(data.get("client") or data.get("client_name") or "").strip()
        txn_type = str(data.get("transaction_type") or "Purchase").strip()
        commodity = str(data.get("commodity") or "").strip()
        weight = float(data.get("weight") or 0)
        rate = float(data.get("rate") or 0)
        total = float(data.get("total") or (weight * rate))
        paid = float(data.get("paid") or 0)
        advance = float(data.get("advance_payment") or 0)
        vehicle = str(data.get("vehicle") or "").strip()
        vehicle_num = str(data.get("vehicle_number") or "").strip()
        gate_pass = str(data.get("gate_pass") or "").strip()
        payer = str(data.get("expense_payer") or "Company").strip()

        kiraya = float(data.get("kiraya") or 0)
        kanta = float(data.get("kanta_charges") or 0)
        loading = float(data.get("loading") or 0)
        unloading = float(data.get("unloading") or 0)
        brokery = float(data.get("brokery") or 0)
        other_exp = float(data.get("other_expenses") or 0)
        expense_total = kiraya + kanta + loading + unloading + brokery + other_exp

        # Precise Trade Settlement Balance:
        if txn_type == "Purchase":
            # Buying from farmer/supplier:
            # If Client bears transport/mandi expense, it is deducted from their payout.
            # If Company bears it, farmer gets the full commodity price.
            if payer == "Client":
                bal = total - paid - advance - expense_total
            else:
                bal = total - paid - advance
        else:
            # Selling to buyer/mill:
            # If Client bears transport/mandi expense, it is added to their invoice balance.
            # If Company bears delivery, buyer pays the commodity price.
            if payer == "Client":
                bal = total - paid - advance + expense_total
            else:
                bal = total - paid - advance

        created_at = data.get("created_at") or datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Auto-ensure client exists in clients directory
        if client:
            cur.execute("SELECT id, is_seller, is_purchaser FROM clients WHERE name = ?", (client,))
            crow = cur.fetchone()
            if not crow:
                cur.execute("SELECT MAX(CAST(id AS INTEGER)) FROM clients")
                max_id = cur.fetchone()[0]
                new_cid = str((max_id or 0) + 1)
                is_seller = 1 if txn_type == "Purchase" else 0
                is_purchaser = 1 if txn_type == "Sale" else 0
                cur.execute("""
                    INSERT INTO clients (id, name, caste, mobile, address, village, is_seller, is_purchaser)
                    VALUES (?, ?, '', '', '', '', ?, ?)
                """, (new_cid, client, is_seller, is_purchaser))
            else:
                if txn_type == "Purchase" and not crow["is_seller"]:
                    cur.execute("UPDATE clients SET is_seller = 1 WHERE name = ?", (client,))
                elif txn_type == "Sale" and not crow["is_purchaser"]:
                    cur.execute("UPDATE clients SET is_purchaser = 1 WHERE name = ?", (client,))

        if txn_id:
            cur.execute("""
                UPDATE transactions SET client=?, transaction_type=?, commodity=?, weight=?, rate=?,
                total=?, paid=?, balance=?, vehicle=?, vehicle_number=?, kiraya=?, kanta_charges=?,
                loading=?, unloading=?, brokery=?, other_expenses=?, created_at=?, advance_payment=?,
                gate_pass=?, expense_payer=?
                WHERE id=?
            """, (client, txn_type, commodity, weight, rate, total, paid, bal, vehicle, vehicle_num,
                  kiraya, kanta, loading, unloading, brokery, other_exp, created_at, advance, gate_pass, payer, txn_id))
        else:
            cur.execute("""
                INSERT INTO transactions (
                    client, transaction_type, commodity, weight, rate, total, paid, balance, vehicle,
                    vehicle_number, kiraya, kanta_charges, loading, unloading, brokery, other_expenses,
                    created_at, advance_payment, gate_pass, expense_payer
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (client, txn_type, commodity, weight, rate, total, paid, bal, vehicle, vehicle_num,
                  kiraya, kanta, loading, unloading, brokery, other_exp, created_at, advance, gate_pass, payer))
            txn_id = cur.lastrowid

        conn.commit()
        conn.close()
        return jsonify({"success": True, "id": txn_id, "balance": bal})

    # GET
    role = request.args.get("role", "All")
    client = request.args.get("client", "").strip()
    commodity = request.args.get("commodity", "").strip()
    txn_type = request.args.get("transaction_type", "").strip()
    from_date = request.args.get("from_date", "").strip()
    to_date = request.args.get("to_date", "").strip()
    search = request.args.get("search", "").strip()

    query = "SELECT * FROM transactions WHERE 1=1"
    params = []

    if role == "Seller":
        query += " AND transaction_type = 'Purchase'"
    elif role == "Purchaser":
        query += " AND transaction_type = 'Sale'"
    elif txn_type:
        query += " AND transaction_type = ?"
        params.append(txn_type)

    if client:
        query += " AND client = ?"
        params.append(client)

    if commodity:
        query += " AND commodity = ?"
        params.append(commodity)

    if from_date:
        query += " AND created_at >= ?"
        params.append(f"{from_date} 00:00:00")

    if to_date:
        query += " AND created_at <= ?"
        params.append(f"{to_date} 23:59:59")

    if search:
        query += " AND (client LIKE ? OR commodity LIKE ? OR vehicle_number LIKE ? OR gate_pass LIKE ?)"
        wildcard = f"%{search}%"
        params.extend([wildcard, wildcard, wildcard, wildcard])

    query += " ORDER BY created_at DESC, id DESC"
    cur.execute(query, params)
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return jsonify(rows)

@app.route("/api/transactions/<int:txn_id>", methods=["DELETE"])
def delete_transaction(txn_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM transactions WHERE id = ?", (txn_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

# ----------------- PAYMENTS / CASHBOOK API -----------------
@app.route("/api/payments", methods=["GET", "POST"])
def payments():
    conn = get_db()
    cur = conn.cursor()

    if request.method == "POST":
        data = request.json
        pid = data.get("id")
        client = str(data.get("client") or data.get("client_name") or "").strip()
        direction = str(data.get("direction") or data.get("payment_direction") or "Pay to Seller").strip()
        amount = float(data.get("amount") or 0)
        mode = str(data.get("payment_mode") or "Cash").strip()
        note = str(data.get("note") or data.get("notes") or "").strip()
        created_at = data.get("created_at") or datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        if not client or amount <= 0:
            return jsonify({"error": "Valid client and amount required"}), 400

        # Auto-ensure client exists
        cur.execute("SELECT id, is_seller, is_purchaser FROM clients WHERE name = ?", (client,))
        crow = cur.fetchone()
        if not crow:
            cur.execute("SELECT MAX(CAST(id AS INTEGER)) FROM clients")
            max_id = cur.fetchone()[0]
            new_cid = str((max_id or 0) + 1)
            is_s = 1 if "Seller" in direction else 0
            is_p = 1 if "Purchaser" in direction else 0
            cur.execute("""
                INSERT INTO clients (id, name, caste, mobile, address, village, is_seller, is_purchaser)
                VALUES (?, ?, '', '', '', '', ?, ?)
            """, (new_cid, client, is_s, is_p))

        if pid:
            cur.execute("""
                UPDATE client_payments SET client=?, direction=?, amount=?, note=?, created_at=?, payment_mode=?
                WHERE id=?
            """, (client, direction, amount, note, created_at, mode, pid))
        else:
            cur.execute("""
                INSERT INTO client_payments (client, direction, amount, note, created_at, payment_mode)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (client, direction, amount, note, created_at, mode))
            pid = cur.lastrowid

        conn.commit()
        conn.close()
        return jsonify({"success": True, "id": pid})

    # GET
    client = request.args.get("client", "").strip()
    direction = request.args.get("direction", "").strip()
    from_date = request.args.get("from_date", "").strip()
    to_date = request.args.get("to_date", "").strip()
    search = request.args.get("search", "").strip()

    query = "SELECT * FROM client_payments WHERE 1=1"
    params = []

    if client:
        query += " AND client = ?"
        params.append(client)
    if direction:
        query += " AND direction = ?"
        params.append(direction)
    if from_date:
        query += " AND created_at >= ?"
        params.append(f"{from_date} 00:00:00")
    if to_date:
        query += " AND created_at <= ?"
        params.append(f"{to_date} 23:59:59")
    if search:
        query += " AND (client LIKE ? OR note LIKE ? OR payment_mode LIKE ?)"
        wildcard = f"%{search}%"
        params.extend([wildcard, wildcard, wildcard])

    query += " ORDER BY created_at DESC, id DESC"
    cur.execute(query, params)
    rows = [dict(r) for r in cur.fetchall()]

    # Summary
    cur.execute("""
        SELECT
            COALESCE(SUM(CASE WHEN direction IN ('Receive from Purchaser', 'Refund from Seller') THEN amount ELSE 0 END), 0) as cash_in,
            COALESCE(SUM(CASE WHEN direction IN ('Pay to Seller', 'Refund to Purchaser') THEN amount ELSE 0 END), 0) as cash_out
        FROM client_payments
    """)
    sum_row = dict(cur.fetchone())
    conn.close()

    return jsonify({
        "records": rows,
        "cash_in": float(sum_row["cash_in"]),
        "cash_out": float(sum_row["cash_out"]),
        "net_cash": float(sum_row["cash_in"] - sum_row["cash_out"])
    })

@app.route("/api/payments/<int:pid>", methods=["DELETE"])
def delete_payment(pid):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM client_payments WHERE id = ?", (pid,))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

# ----------------- BILL & LEDGER API -----------------
@app.route("/api/bill/<client_name>")
def get_client_bill(client_name):
    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT * FROM clients WHERE name = ?", (client_name,))
    client_row = cur.fetchone()
    if not client_row:
        conn.close()
        return jsonify({"error": "Client not found"}), 404

    client = dict(client_row)
    cur.execute("SELECT * FROM bank_accounts WHERE client_id = ?", (client["id"],))
    client["bank_account"] = [dict(b) for b in cur.fetchall()]

    cur.execute("SELECT * FROM transactions WHERE client = ? ORDER BY created_at ASC, id ASC", (client_name,))
    transactions_list = [dict(t) for t in cur.fetchall()]

    cur.execute("SELECT * FROM client_payments WHERE client = ? ORDER BY created_at ASC, id ASC", (client_name,))
    payments_list = [dict(p) for p in cur.fetchall()]

    # Computations
    total_amount = sum(t["total"] or 0 for t in transactions_list)
    total_paid_txn = sum((t["paid"] or 0) + (t["advance_payment"] or 0) for t in transactions_list)
    total_balance_txn = sum(t["balance"] or 0 for t in transactions_list)

    total_exp_company = sum(
        (t["kiraya"] or 0) + (t["kanta_charges"] or 0) + (t["loading"] or 0) +
        (t["unloading"] or 0) + (t["brokery"] or 0) + (t["other_expenses"] or 0)
        for t in transactions_list if t.get("expense_payer") == "Company"
    )
    total_exp_client = sum(
        (t["kiraya"] or 0) + (t["kanta_charges"] or 0) + (t["loading"] or 0) +
        (t["unloading"] or 0) + (t["brokery"] or 0) + (t["other_expenses"] or 0)
        for t in transactions_list if t.get("expense_payer") == "Client"
    )

    total_ledger_paid = 0
    for p in payments_list:
        amt = float(p["amount"] or 0)
        if "Refund" in (p["direction"] or ""):
            total_ledger_paid -= amt
        else:
            total_ledger_paid += amt

    # Net due
    # Sale (+) - Purchase (-) + Pay/Refund to client (+) - Receive/Refund from client (-)
    sale_bal = sum(t["balance"] or 0 for t in transactions_list if t["transaction_type"] == "Sale")
    purch_bal = sum(t["balance"] or 0 for t in transactions_list if t["transaction_type"] == "Purchase")
    paid_to = sum(p["amount"] or 0 for p in payments_list if p["direction"] in ('Pay to Seller', 'Refund to Purchaser'))
    rec_from = sum(p["amount"] or 0 for p in payments_list if p["direction"] in ('Receive from Purchaser', 'Refund from Seller'))
    net_due = sale_bal - purch_bal + paid_to - rec_from

    conn.close()

    status = "FULLY SETTLED"
    if net_due > 1:
        status = "DEBIT - Client Owes Company"
    elif net_due < -1:
        status = "CREDIT - Company Owes Client"

    return jsonify({
        "client": client,
        "transactions": transactions_list,
        "payments": payments_list,
        "financials": {
            "total_amount": total_amount,
            "total_paid_txn": total_paid_txn,
            "total_balance_txn": total_balance_txn,
            "total_exp_company": total_exp_company,
            "total_exp_client": total_exp_client,
            "total_expenses": total_exp_company + total_exp_client,
            "total_ledger_paid": total_ledger_paid,
            "sale_bal": sale_bal,
            "purch_bal": purch_bal,
            "paid_to_client": paid_to,
            "received_from_client": rec_from,
            "net_due": net_due,
            "abs_net_due": abs(net_due),
            "status": status
        }
    })

# ----------------- BACKUP & EXCEL EXPORT -----------------
@app.route("/api/backup")
def backup_database():
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return send_file(DB_PATH, as_attachment=True, download_name=f"commodity_mis_backup_{timestamp}.db")

@app.route("/api/export-csv/<table_name>")
def export_csv(table_name):
    if table_name not in ["clients", "transactions", "client_payments"]:
        return jsonify({"error": "Invalid table"}), 400
    conn = get_db()
    cur = conn.cursor()
    cur.execute(f"SELECT * FROM {table_name}")
    rows = cur.fetchall()
    cols = [d[0] for d in cur.description]
    conn.close()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(cols)
    for r in rows:
        writer.writerow(list(r))

    output.seek(0)
    bytes_io = io.BytesIO(output.getvalue().encode("utf-8-sig"))
    return send_file(bytes_io, mimetype="text/csv", as_attachment=True, download_name=f"{table_name}_export.csv")

@app.route("/api/delete-all-data", methods=["POST"])
@app.route("/api/clear-all-data", methods=["POST"])
def delete_all_data():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM clients")
    cur.execute("DELETE FROM transactions")
    cur.execute("DELETE FROM client_payments")
    cur.execute("DELETE FROM bank_accounts")
    try:
        cur.execute("DELETE FROM sqlite_sequence WHERE name IN ('transactions', 'client_payments', 'bank_accounts')")
    except Exception:
        pass
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "All records permanently deleted."})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting Mallah Traders Web MIS Dashboard on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
