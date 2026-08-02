import sqlite3
import os

db_path = 'vantillu.db'
if not os.path.exists(db_path):
    print("DB not found at", db_path)
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()
try:
    cursor.execute('ALTER TABLE "orders" ADD COLUMN latitude FLOAT;')
    cursor.execute('ALTER TABLE "orders" ADD COLUMN longitude FLOAT;')
    conn.commit()
    print("Added latitude and longitude to orders table")
except Exception as e:
    print("Error altering table:", e)

cursor.execute('PRAGMA table_info("order");')
columns = cursor.fetchall()

if not columns:
    cursor.execute('PRAGMA table_info("orders");')
    columns = cursor.fetchall()

print("Columns in order table:")
for col in columns:
    print(f"{col[1]} - {col[2]}")
