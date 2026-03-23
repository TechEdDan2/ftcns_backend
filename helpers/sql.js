const { BadRequestError } = require('../expressError');

/**
 * A Helper function for making partial update queries. It can handle
 * bad input and throws BadRequestError if no data provided.
 * 
 * @param {Object} dataToUpdate - {field1: newVal, field2: newVal, ...}
 * @param {Object} jsToSql - mapping of js-style data fields to sql-style fields
 * 
 * @returns {Object} - {setCols: '"field1"=$1, "field2"=$2, ...', values: [newVal, newVal, ...]} 
 * 
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
    const keys = Object.keys(dataToUpdate);
    if (keys.length === 0) throw new BadRequestError("No data");

    const cols = keys.map((colName, idx) =>
        `"${jsToSql[colName] || colName}"=$${idx + 1}`,
    );

    return {
        setCols: cols.join(", "),
        values: Object.values(dataToUpdate),
    };
}

module.exports = { sqlForPartialUpdate };