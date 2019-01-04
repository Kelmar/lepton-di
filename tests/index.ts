const assert = require('assert');

import { runAllTests } from './decorators';

import './injection_tests';
import './scope_tests';

runAllTests();
