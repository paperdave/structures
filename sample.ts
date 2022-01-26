import { Structure, types } from './src';

const Test = new Structure('Test').prop('name', types.String).create();

const test = new Test({ name: 'test' });
