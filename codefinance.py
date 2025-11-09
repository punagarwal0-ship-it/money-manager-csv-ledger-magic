import csv
import os
import datetime
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_cors import CORS

FILE_NAME = os.getenv('TRANSACTIONS_FILE', 'transactions.csv')

app = Flask(__name__)
CORS(app)
app.secret_key = os.getenv('FLASK_SECRET_KEY', os.urandom(24))  # Use environment variable or generate secure key


def ensure_csv():
    if not os.path.exists(FILE_NAME):
        with open(FILE_NAME, mode='w', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerow(['ID', 'Date', 'Type', 'Category', 'Amount', 'PaymentMethod', 'Description'])


def generate_id():
    max_id = 0
    try:
        with open(FILE_NAME, newline='', encoding='utf-8') as file:
            reader = csv.reader(file)
            next(reader, None)
            for row in reader:
                if not row:
                    continue
                try:
                    rid = int(row[0])
                    if rid > max_id:
                        max_id = rid
                except (ValueError, IndexError):
                    continue
        return max_id + 1
    except FileNotFoundError:
        return 1


def read_all_transactions():
    ensure_csv()
    with open(FILE_NAME, newline='', encoding='utf-8') as file:
        reader = csv.reader(file)
        rows = list(reader)
    if not rows:
        return []
    return rows[1:]


def write_all_transactions(rows):
    ensure_csv()
    with open(FILE_NAME, 'w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(['ID', 'Date', 'Type', 'Category', 'Amount', 'PaymentMethod', 'Description'])
        for r in rows:
            writer.writerow(r)


def get_transaction_by_id(tid):
    for row in read_all_transactions():
        if row and row[0] == str(tid):
            return row
    return None


@app.route('/api/transactions')
def get_transactions():
    rows = read_all_transactions()
    transactions = []
    for row in rows:
        if row:
            transactions.append({
                'id': row[0],
                'date': row[1],
                'type': row[2],
                'category': row[3],
                'amount': float(row[4]),
                'paymentMethod': row[5],
                'description': row[6]
            })
    return jsonify(transactions)


@app.route('/')
def health():
    """Health check endpoint for Render and other platforms."""
    return jsonify({"status": "ok"}), 200


@app.route('/add', methods=['GET', 'POST'])
def add():
    if request.method == 'POST':
        date_input = request.form.get('date') or str(datetime.date.today())
        try:
            # validate date
            _ = datetime.date.fromisoformat(date_input)
        except Exception:
            flash('Invalid date format. Use YYYY-MM-DD')
            return redirect(url_for('add'))
        trans_type = request.form.get('type', '').strip().lower()
        category = request.form.get('category', '').strip()
        try:
            amount = float(request.form.get('amount', '0'))
        except ValueError:
            flash('Invalid amount')
            return redirect(url_for('add'))
        payment_method = request.form.get('payment_method', '').strip()
        description = request.form.get('description', '').strip()

        if trans_type not in ['income', 'expense']:
            flash("Type must be 'Income' or 'Expense'")
            return redirect(url_for('add'))

        tid = generate_id()
        with open(FILE_NAME, 'a', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerow([tid, date_input, trans_type.capitalize(), category, amount, payment_method, description])
        flash('Transaction added')
        return redirect(url_for('index'))
    return render_template('add.html')


@app.route('/update/<tid>', methods=['GET', 'POST'])
def update(tid):
    tx = get_transaction_by_id(tid)
    if not tx:
        flash('Transaction not found')
        return redirect(url_for('index'))
    if request.method == 'POST':
        date_input = request.form.get('date') or tx[1]
        try:
            _ = datetime.date.fromisoformat(date_input)
        except Exception:
            flash('Invalid date format. Keeping previous date')
            date_input = tx[1]
        trans_type = request.form.get('type', tx[2]).strip().lower() or tx[2].lower()
        category = request.form.get('category', tx[3]).strip() or tx[3]
        try:
            amount = float(request.form.get('amount', tx[4]))
        except ValueError:
            flash('Invalid amount. Keeping previous value')
            amount = float(tx[4])
        payment_method = request.form.get('payment_method', tx[5]).strip() or tx[5]
        description = request.form.get('description', tx[6]).strip() or tx[6]

        rows = read_all_transactions()
        new_rows = []
        for row in rows:
            if row and row[0] == str(tid):
                new_rows.append([row[0], date_input, trans_type.capitalize(), category, amount, payment_method, description])
            else:
                new_rows.append(row)
        write_all_transactions(new_rows)
        flash('Transaction updated')
        return redirect(url_for('index'))
    return render_template('update.html', tx=tx)


@app.route('/delete/<tid>', methods=['POST'])
def delete(tid):
    rows = read_all_transactions()
    new_rows = [r for r in rows if r and r[0] != str(tid)]
    write_all_transactions(new_rows)
    flash('Transaction deleted')
    return redirect(url_for('index'))


@app.route('/summary')
def summary():
    total_income = 0
    total_expense = 0
    category_expenses = {}
    for row in read_all_transactions():
        try:
            trans_type = row[2].lower()
            amount = float(row[4])
            category = row[3]
        except Exception:
            continue
        if trans_type == 'income':
            total_income += amount
        elif trans_type == 'expense':
            total_expense += amount
            category_expenses[category] = category_expenses.get(category, 0) + amount
    balance = total_income - total_expense
    return render_template('summary.html', income=total_income, expense=total_expense, balance=balance, category_expenses=category_expenses)


@app.route('/search', methods=['GET', 'POST'])
def search():
    results = []
    if request.method == 'POST':
        mode = request.form.get('mode')
        if mode == 'date':
            date_search = request.form.get('date_search', '').strip()
            for row in read_all_transactions():
                if row and row[1] == date_search:
                    results.append(row)
        elif mode == 'category':
            category_search = request.form.get('category_search', '').strip().lower()
            for row in read_all_transactions():
                if row and row[3].lower() == category_search:
                    results.append(row)
        elif mode == 'amount':
            try:
                min_amt = float(request.form.get('min_amt', '0'))
                max_amt = float(request.form.get('max_amt', '0'))
            except ValueError:
                flash('Invalid amount inputs')
                return redirect(url_for('search'))
            for row in read_all_transactions():
                try:
                    amt = float(row[4])
                except Exception:
                    continue
                if min_amt <= amt <= max_amt:
                    results.append(row)
        else:
            flash('Invalid search mode')
    return render_template('search.html', results=results)


if __name__ == '__main__':
    ensure_csv()
    # In production, use environment variables for host and port
    host = os.getenv('FLASK_HOST', '0.0.0.0')
    port = int(os.getenv('FLASK_PORT', '8000'))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    app.run(
        host=host,
        port=port,
        debug=debug
    )