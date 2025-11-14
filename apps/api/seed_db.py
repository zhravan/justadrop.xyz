#!/usr/bin/env python3
"""
Convenience script to run database seeding from the project root.
"""

import sys
import os

# Add the current directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.core.seed import seed_database

if __name__ == "__main__":
    seed_database()

