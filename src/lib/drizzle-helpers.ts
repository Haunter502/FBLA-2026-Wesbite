// Wrapper functions to hide drizzle-orm imports from Turbopack static analysis
// These functions use dynamic requires to prevent bundling

let _drizzleOrm: any = null;

function getDrizzleOrm() {
  if (!_drizzleOrm) {
    // Use eval to prevent static analysis
    _drizzleOrm = eval('require')('drizzle-orm');
  }
  return _drizzleOrm;
}

export function eq(left: any, right: any) {
  return getDrizzleOrm().eq(left, right);
}

export function desc(column: any) {
  return getDrizzleOrm().desc(column);
}

export function asc(column: any) {
  return getDrizzleOrm().asc(column);
}

export function and(...conditions: any[]) {
  return getDrizzleOrm().and(...conditions);
}

export function or(...conditions: any[]) {
  return getDrizzleOrm().or(...conditions);
}

export function not(condition: any) {
  return getDrizzleOrm().not(condition);
}

export function like(column: any, pattern: string) {
  return getDrizzleOrm().like(column, pattern);
}

export function ilike(column: any, pattern: string) {
  return getDrizzleOrm().ilike(column, pattern);
}

export function inArray(column: any, values: any[]) {
  return getDrizzleOrm().inArray(column, values);
}

export function gte(column: any, value: any) {
  return getDrizzleOrm().gte(column, value);
}

export function gt(column: any, value: any) {
  return getDrizzleOrm().gt(column, value);
}

export function lte(column: any, value: any) {
  return getDrizzleOrm().lte(column, value);
}

export function lt(column: any, value: any) {
  return getDrizzleOrm().lt(column, value);
}

export function isNull(column: any) {
  return getDrizzleOrm().isNull(column);
}

export function isNotNull(column: any) {
  return getDrizzleOrm().isNotNull(column);
}

export function sql(query: string, ...args: any[]) {
  return getDrizzleOrm().sql(query, ...args);
}

