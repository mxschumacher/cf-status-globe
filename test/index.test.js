import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';

// importing a private function
import { __private } from '../src/index.js';

if (__private === undefined) {
	throw new Error("You'll need the environment variable to be set to 'development' to export private functions")
}

const extractIATACodeFromName = __private.extractIATACodeFromName;

describe('extractIATACodeFromName', () => {
	it('should extract IATA code from a valid string', () => {
		expect(extractIATACodeFromName('John F. Kennedy International Airport (JFK)')).toBe('JFK');
		expect(extractIATACodeFromName('Los Angeles International Airport (LAX)')).toBe('LAX');
		expect(extractIATACodeFromName('Charles de Gaulle Airport (CDG)')).toBe('CDG');
	});

	it('should return an empty string if the input is empty', () => {
		expect(extractIATACodeFromName('')).toBe('');
	});

	it('should return an empty string if the input is not of type string', () => {
		expect(extractIATACodeFromName(5)).toBe('');
		expect(extractIATACodeFromName({})).toBe('');
		expect(extractIATACodeFromName(2.5)).toBe('');
		expect(extractIATACodeFromName([])).toBe('');
	});

	it('should return an empty string if the input contains only whitespace', () => {
		expect(extractIATACodeFromName('   ')).toBe('');
	});

	it('should return an empty string if no parentheses are present', () => {
		expect(extractIATACodeFromName('John F. Kennedy International Airport')).toBe('');
		expect(extractIATACodeFromName('Los Angeles International Airport')).toBe('');
	});

	it('should handle strings with misplaced parentheses', () => {
		expect(extractIATACodeFromName('John F. Kennedy International Airport (JFK')).toBe('');
		expect(extractIATACodeFromName('Los Angeles International Airport JFK)')).toBe('');
	});

	it('should handle strings with parentheses at the beginning or end', () => {
		expect(extractIATACodeFromName('(JFK) John F. Kennedy International Airport')).toBe('JFK');
		expect(extractIATACodeFromName('Los Angeles International Airport (LAX)')).toBe('LAX');
	});
});
