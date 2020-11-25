require('dotenv').config();
const {getQueue} = require('./jobs/queue');

const queue = getQueue('zone');
queue.clean(10, 'completed');
queue.clean(10, 'active');
queue.clean(10, 'wait');
queue.clean(10, 'delayed');
