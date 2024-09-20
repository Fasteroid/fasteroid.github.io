import * as fs from 'fs'
import { getUser } from './scripts/api';

console.log( await getUser(91351883) )