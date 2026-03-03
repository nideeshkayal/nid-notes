---
title: JavaScript Closures
tags: [javascript, programming, fundamentals]
created: 2025-01-20
author: Nid
description: Understanding closures in JavaScript
---

# JavaScript Closures

A closure is the combination of a function bundled together with references to its surrounding state (the lexical environment).

## What is a Closure?

```javascript
function createCounter() {
  let count = 0;
  
  return {
    increment() {
      count++;
      return count;
    },
    decrement() {
      count--;
      return count;
    },
    getCount() {
      return count;
    }
  };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.decrement()); // 1
```

## Practical Use Cases

### Data Privacy

```javascript
function createUser(name) {
  // Private variable - only accessible via closure
  let _password = '';
  
  return {
    getName: () => name,
    setPassword: (pw) => { _password = pw; },
    validatePassword: (pw) => pw === _password
  };
}
```

### Event Handlers

```javascript
function setupButtons() {
  for (let i = 0; i < 5; i++) {
    document.getElementById(`btn-${i}`)
      .addEventListener('click', () => {
        console.log(`Button ${i} clicked`);
      });
  }
}
```

> [!WARNING]
> Using `var` instead of `let` in the loop above would cause all buttons to log `Button 5 clicked` due to how `var` scoping works with closures.

## Common Pitfalls

### Memory Leaks

Closures can prevent garbage collection of variables they reference:

```javascript
function setupHandler() {
  const hugeData = new Array(1000000).fill('🎯');
  
  // This closure keeps hugeData alive!
  return function() {
    console.log(hugeData.length);
  };
}
```

> [!TIP]
> Set large references to `null` when no longer needed inside closures to allow garbage collection.
