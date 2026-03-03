---
title: Python Async/Await
tags:
  - python
  - programming
  - async
created: 2025-03-01T00:00:00.000Z
author: Nid
description: Asynchronous programming with Python's asyncio
draft: false
---

# Python Async/Await

Python's `asyncio` library provides infrastructure for writing single-threaded concurrent code using 

## Basic Syntax

```python
import asyncio

async def fetch_data(url: str) -> dict:
    """Simulate fetching data from a URL."""
    print(f"Fetching {url}...")
    await asyncio.sleep(1)  # Simulate network delay
    return {"url": url, "data": "result"}

async def main():
    result = await fetch_data("https://api.example.com")
    print(result)

asyncio.run(main())
```

## Running Tasks Concurrently

```python
async def main():
    # Run multiple coroutines concurrently
    tasks = [
        fetch_data("https://api1.example.com"),
        fetch_data("https://api2.example.com"),
        fetch_data("https://api3.example.com"),
    ]
    
    results = await asyncio.gather(*tasks)
    
    for result in results:
        print(result)
```

> [!NOTE]
> `asyncio.gather()` runs all tasks concurrently and returns results in the same order as the input tasks.

## Async Context Managers

```python
class AsyncDatabase:
    async def __aenter__(self):
        self.connection = await self.connect()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.connection.close()
    
    async def connect(self):
        await asyncio.sleep(0.1)
        return self

# Usage
async def main():
    async with AsyncDatabase() as db:
        await db.query("SELECT * FROM users")
```

## Error Handling

```python
async def risky_operation():
    try:
        result = await fetch_data("https://unstable-api.com")
        return result
    except asyncio.TimeoutError:
        print("Request timed out!")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        print("Cleanup complete")
```

> [!TIP]
> Use `asyncio.wait_for()` to add timeouts to any coroutine:
> ```python
> result = await asyncio.wait_for(fetch_data(url), timeout=5.0)
> ```
