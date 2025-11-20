#!/usr/bin/env python3
"""
VitalGo - Countries Data Import Script

This script imports country data from countries_seed.sql into a PostgreSQL database.
It can be used to populate a new database or update an existing one.

Usage:
    poetry run python database/seeds/import_countries.py

    # Or with custom database URL
    DATABASE_URL="postgresql://user:pass@host:port/db" poetry run python database/seeds/import_countries.py
"""

import os
import sys
from pathlib import Path
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Colors for terminal output
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_success(message):
    print(f"{Colors.GREEN}✓{Colors.ENDC} {message}")

def print_error(message):
    print(f"{Colors.RED}✗{Colors.ENDC} {message}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ{Colors.ENDC} {message}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠{Colors.ENDC} {message}")

def get_database_url():
    """Get database URL from environment or return None."""
    return os.getenv('DATABASE_URL')

def check_table_exists(conn):
    """Check if countries table exists."""
    result = conn.execute(text("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_name = 'countries'
        )
    """))
    return result.scalar()

def count_existing_records(conn):
    """Count existing records in countries table."""
    try:
        result = conn.execute(text("SELECT COUNT(*) FROM countries"))
        return result.scalar()
    except Exception:
        return 0

def import_countries(database_url=None, force=False):
    """
    Import countries data from SQL file.

    Args:
        database_url (str): PostgreSQL connection URL
        force (bool): If True, truncate table before importing
    """
    print(f"\n{Colors.BOLD}VitalGo Countries Data Import{Colors.ENDC}")
    print("=" * 50)

    # Get database URL
    db_url = database_url or get_database_url()
    if not db_url:
        print_error("DATABASE_URL not found in environment variables")
        print_info("Please set DATABASE_URL or pass it as parameter")
        sys.exit(1)

    # Hide password in output
    safe_url = db_url.split('@')[1] if '@' in db_url else db_url
    print_info(f"Connecting to: {safe_url}")

    # Read SQL file
    sql_file = Path(__file__).parent / 'countries_seed.sql'
    if not sql_file.exists():
        print_error(f"SQL file not found: {sql_file}")
        sys.exit(1)

    print_info(f"Reading SQL file: {sql_file.name}")

    try:
        with open(sql_file, 'r', encoding='utf-8') as f:
            sql_content = f.read()
    except Exception as e:
        print_error(f"Failed to read SQL file: {e}")
        sys.exit(1)

    # Connect to database
    try:
        engine = create_engine(db_url)
        with engine.connect() as conn:
            # Check if table exists
            table_exists = check_table_exists(conn)

            if table_exists:
                existing_count = count_existing_records(conn)
                print_info(f"Table 'countries' exists with {existing_count} records")

                if existing_count > 0 and not force:
                    print_warning("Table already has data!")
                    response = input(f"{Colors.YELLOW}Do you want to truncate and reimport? (yes/no): {Colors.ENDC}")
                    if response.lower() not in ['yes', 'y']:
                        print_info("Import cancelled by user")
                        sys.exit(0)
                    force = True

                if force:
                    print_info("Truncating existing data...")
                    conn.execute(text("TRUNCATE TABLE countries RESTART IDENTITY CASCADE"))
                    conn.commit()
                    print_success("Table truncated")
            else:
                print_info("Table 'countries' does not exist, will be created")

            # Execute SQL file
            print_info("Importing countries data...")

            # Split by semicolons and execute each statement
            statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]

            for i, statement in enumerate(statements):
                # Skip comments
                if statement.startswith('--'):
                    continue

                try:
                    conn.execute(text(statement))
                except Exception as e:
                    print_error(f"Error executing statement {i+1}: {str(e)[:100]}")
                    # Continue with other statements

            conn.commit()

            # Verify import
            final_count = count_existing_records(conn)
            print_success(f"Import completed! Total records: {final_count}")

            # Show sample data
            print_info("\nSample data (first 5 countries):")
            result = conn.execute(text("""
                SELECT id, name, code, flag_emoji, phone_code
                FROM countries
                ORDER BY id
                LIMIT 5
            """))

            for row in result:
                print(f"  {row[0]:3d}. {row[3]} {row[1]:25s} ({row[2]}) {row[4]}")

            print_success("\n✅ Countries data imported successfully!")

    except Exception as e:
        print_error(f"Database error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description='Import VitalGo countries data')
    parser.add_argument('--database-url', help='PostgreSQL database URL')
    parser.add_argument('--force', action='store_true', help='Force truncate before import')

    args = parser.parse_args()

    import_countries(database_url=args.database_url, force=args.force)
