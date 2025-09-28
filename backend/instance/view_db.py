import sqlite3
from tabulate import tabulate  # pip install tabulate

# connect to DB
conn = sqlite3.connect("database.db")
cursor = conn.cursor()

username = input("Enter username: ")

query = """
SELECT e.id, u.username, e.amount, e.date, e.category, e.description
FROM expense e
JOIN user u ON e.user_id = u.id
WHERE u.username = ?;
"""
cursor.execute(query, (username,))
rows = cursor.fetchall()

if rows:
    headers = ["Expense ID", "Username", "Amount", "Date", "Category", "Description"]
    print("\nExpenses for user:", username)
    print(tabulate(rows, headers=headers, tablefmt="pretty"))
else:
    print(f"No expenses found for user '{username}'.")

conn.close()
