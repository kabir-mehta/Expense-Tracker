from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import pandas as pd
import io
import csv
from flask import send_file

app = Flask(__name__)
app.secret_key = "super-secret-key"

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
#CORS(app, supports_credentials=True)
CORS(
    app,
    origins=["http://localhost:3000"],
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)


# ---------------- Models ----------------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)

class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.String(50), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(200))

with app.app_context():
    db.create_all()

# ---------------- Auth ----------------
@app.route("/api/register", methods=["POST", "OPTIONS"])
def register():
    if request.method == "OPTIONS":
        return '', 200

    data = request.get_json(force=True)
    print("DEBUG received:", data)
    if not data or "username" not in data or "password" not in data:
        return jsonify({"error": "Missing username or password"}), 400

    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"error": "Username exists"}), 400

    hashed = generate_password_hash(data["password"])
    user = User(username=data["username"], password=hashed)
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "User registered"}), 201

@app.route("/api/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        return '', 200
    data = request.json
    user = User.query.filter_by(username=data["username"]).first()
    if user and check_password_hash(user.password, data["password"]):
        session["user_id"] = user.id
        return jsonify({"message": "Login successful"})
    return jsonify({"error": "Invalid credentials"}), 401

@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out"})

def login_required(func):
    def wrapper(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"error": "Unauthorized"}), 401
        return func(*args, **kwargs)
    wrapper.__name__ = func.__name__
    return wrapper

# ---------------- Expenses ----------------
@app.route("/api/expenses", methods=["GET"])
@login_required
def get_expenses():
    expenses = Expense.query.filter_by(user_id=session["user_id"]).all()
    return jsonify([{
        "id": e.id,
        "amount": e.amount,
        "date": e.date,
        "category": e.category,
        "description": e.description
    } for e in expenses])

@app.route("/api/expenses", methods=["POST"])
@login_required
def add_expense():
    data = request.json
    expense = Expense(
        user_id=session["user_id"],
        amount=float(data["amount"]),
        date=data["date"],
        category=data["category"],
        description=data.get("description", "")
    )
    db.session.add(expense)
    db.session.commit()
    return jsonify({"message": "Expense added"})

@app.route("/api/expenses/<int:expense_id>", methods=["PUT"])
@login_required
def edit_expense(expense_id):
    data = request.json
    expense = Expense.query.filter_by(id=expense_id, user_id=session["user_id"]).first()
    if not expense:
        return jsonify({"error": "Expense not found"}), 404
    expense.amount = data.get("amount", expense.amount)
    expense.date = data.get("date", expense.date)
    expense.category = data.get("category", expense.category)
    expense.description = data.get("description", expense.description)
    db.session.commit()
    return jsonify({"message": "Expense updated"})

@app.route("/api/expenses/<int:expense_id>", methods=["DELETE"])
@login_required
def delete_expense(expense_id):
    expense = Expense.query.filter_by(id=expense_id, user_id=session["user_id"]).first()
    if not expense:
        return jsonify({"error": "Expense not found"}), 404
    db.session.delete(expense)
    db.session.commit()
    return jsonify({"message": "Expense deleted"})

# Export expenses as CSV
@app.route("/api/expenses/export", methods=["GET"])
@login_required
def export_expenses():
    expenses = Expense.query.filter_by(user_id=session["user_id"]).all()
    if not expenses:
        return jsonify({"error": "No expenses to export"}), 404

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["id", "amount", "date", "category", "description"])
    writer.writeheader()
    for e in expenses:
        writer.writerow({
            "id": e.id,
            "amount": e.amount,
            "date": e.date,
            "category": e.category,
            "description": e.description
        })

    output.seek(0)
    return send_file(
        io.BytesIO(output.getvalue().encode("utf-8")),
        mimetype="text/csv",
        as_attachment=True,
        download_name=f"user_{session['user_id']}_expenses.csv"
    )


# ---------------- Reports ----------------
@app.route("/api/reports", methods=["GET"])
@login_required
def reports():
    expenses = Expense.query.filter_by(user_id=session["user_id"]).all()
    if not expenses:
        return jsonify({"monthly": [], "categories": []})

    df = pd.DataFrame([{
        "amount": e.amount,
        "date": pd.to_datetime(e.date),
        "category": e.category
    } for e in expenses])

    df["month"] = df["date"].dt.to_period("M")
    monthly = df.groupby("month")["amount"].sum().reset_index()
    monthly["month"] = monthly["month"].dt.strftime("%Y-%m")

    category = df.groupby("category")["amount"].sum().reset_index()

    return jsonify({
        "monthly": monthly.to_dict(orient="records"),
        "categories": category.to_dict(orient="records")
    })


@app.route("/api/dashboard", methods=["GET"])
@login_required
def dashboard_stats():
    expenses = Expense.query.filter_by(user_id=session["user_id"]).all()
    if not expenses:
        return jsonify({
            "total_this_month": 0,
            "top_category": None,
            "total_expenses": 0,
            "avg_daily": 0
        })

    df = pd.DataFrame([{
        "amount": e.amount,
        "date": pd.to_datetime(e.date),
        "category": e.category
    } for e in expenses])

    # Total this month
    current_month = pd.Timestamp.now().to_period("M")
    total_this_month = df[df["date"].dt.to_period("M") == current_month]["amount"].sum()

    # Top category
    category_totals = df.groupby("category")["amount"].sum().sort_values(ascending=False)
    top_category = category_totals.index[0] if not category_totals.empty else None

    # Total expenses
    total_expenses = len(df)

    # Average daily spend
    avg_daily = df.groupby(df["date"].dt.date)["amount"].sum().mean()

    return jsonify({
        "total_this_month": float(total_this_month),
        "top_category": top_category,
        "total_expenses": int(total_expenses),
        "avg_daily": round(float(avg_daily), 2) if not pd.isna(avg_daily) else 0
    })


if __name__ == "__main__":
    app.run(debug=True)
