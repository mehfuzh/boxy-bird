// Tests for src/storage.js — SafeStorage must never throw, whether
// localStorage works, throws on access, or starts failing mid-session.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const src = readFileSync(new URL('../src/storage.js', import.meta.url), 'utf8');

function load(windowObj) {
  const ctx = vm.createContext({ window: windowObj });
  vm.runInContext(src, ctx);
  return vm.runInContext('SafeStorage', ctx);
}

function fakeLocalStorage() {
  const map = new Map();
  return {
    getItem: k => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: k => map.delete(k),
    _map: map,
  };
}

function securityError() {
  return new DOMException('Access to storage is denied', 'SecurityError');
}

test('persists through localStorage when available', () => {
  const ls = fakeLocalStorage();
  const s = load({ localStorage: ls });
  s.set('boxyBest', 42);
  assert.equal(s.get('boxyBest'), '42');
  assert.equal(ls._map.get('boxyBest'), '42');
  assert.equal(ls._map.has('__boxy_probe__'), false); // probe cleaned up
});

test('boots and works when the localStorage getter throws', () => {
  const windowObj = {};
  Object.defineProperty(windowObj, 'localStorage', {
    get() { throw securityError(); },
  });
  const s = load(windowObj); // must not throw
  assert.equal(s.get('boxyBest'), null);
  s.set('boxyBest', 7);
  s.set('boxySound', 'off');
  assert.equal(s.get('boxyBest'), '7');
  assert.equal(s.get('boxySound'), 'off');
});

test('boots and works when storage methods throw', () => {
  const ls = {
    getItem() { throw securityError(); },
    setItem() { throw securityError(); },
    removeItem() { throw securityError(); },
  };
  const s = load({ localStorage: ls }); // probe fails, must not throw
  s.set('boxyTheme', 'halloween');
  assert.equal(s.get('boxyTheme'), 'halloween');
});

test('falls back to memory if storage starts failing mid-session', () => {
  const ls = fakeLocalStorage();
  const s = load({ localStorage: ls });
  s.set('boxyBest', 3);
  ls.setItem = () => { throw new DOMException('quota', 'QuotaExceededError'); };
  ls.getItem = () => { throw new DOMException('quota', 'QuotaExceededError'); };
  s.set('boxyBest', 9); // must not throw
  assert.equal(s.get('boxyBest'), '9'); // mirrored in-memory value survives
});

test('missing keys read as null; numbers stringify like localStorage', () => {
  const s = load({ localStorage: fakeLocalStorage() });
  assert.equal(s.get('nope'), null);
  s.set('boxyBest', 12);
  assert.equal(s.get('boxyBest'), '12');
  assert.equal(+s.get('boxyBest'), 12);
});
