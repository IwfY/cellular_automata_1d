'use strict';

document.addEventListener("DOMContentLoaded", init, false);

function CA1D() {
	var i,j;

	this.rules = [];
	this.initRules();
	this.fieldWidth = 100;
	this.fieldHeight = 50;

	this.field = new Field(this.fieldWidth, this.fieldHeight);

	this.initVisuals();
	this.calculateField();
	this.redrawField();
}

CA1D.prototype.initRules = function() {
	this.rules.push(new Rule([[-1, 0], [0, 0], [1, 0]], 0));
	this.rules.push(new Rule([[-1, 0], [0, 0], [1, 1]], 0));
	this.rules.push(new Rule([[-1, 0], [0, 1], [1, 0]], 1));
	this.rules.push(new Rule([[-1, 0], [0, 1], [1, 1]], 1));
	this.rules.push(new Rule([[-1, 1], [0, 0], [1, 0]], 1));
	this.rules.push(new Rule([[-1, 1], [0, 0], [1, 1]], 1));
	this.rules.push(new Rule([[-1, 1], [0, 1], [1, 0]], 1));
	this.rules.push(new Rule([[-1, 1], [0, 1], [1, 1]], 0));
};

CA1D.prototype.getFieldCell = function(row, x) {
	return this.fieldCell(row * this.fieldWidth + x);
}

CA1D.prototype.initVisuals = function() {
	// draw field
	var i, j, row, table, ruleCursor, ruleDiv, ruleTable, ruleTr;

	table = d3.select('#field').append('table');
	for (i = 0; i < this.fieldHeight; ++i) {
		row = table.append('tr').attr('class', 'field-row');
		for (j = 0; j < this.fieldWidth; ++j) {
			row.append('td').attr('class', 'field-cell').text('').attr('row', i).attr('x', j);
		}
	}

	// draw rules
	for (ruleCursor = 0; ruleCursor < this.rules.length; ++ruleCursor) {
		ruleDiv = d3.select('#rules .row').append('div').classed({'c1': true}).text(ruleCursor);
		ruleTable = ruleDiv.append('table').attr('style', 'width: auto;');
		ruleTr = ruleTable.append('tr');

		ruleTr.append('td').classed({'black': this.rules[ruleCursor].fieldParts[0][1]});
		ruleTr.append('td').classed({'black': this.rules[ruleCursor].fieldParts[1][1]});
		ruleTr.append('td').classed({'black': this.rules[ruleCursor].fieldParts[2][1]});

		ruleTr = ruleTable.append('tr');

		ruleTr.append('td').classed({'black': 0});
		ruleTr.append('td').classed({'black': this.rules[ruleCursor].result});
		ruleTr.append('td').classed({'black': 0});
	}
};

CA1D.prototype.redrawField = function() {
	// draw field
	var i, j
	for (i = 0; i < this.fieldHeight; ++i) {
		for (j = 0; j < this.fieldWidth; ++j) {
			d3.select('.field-cell[row="' + i + '"][x="' + j + '"]').classed({'black' : this.field.getCell(i, j)});
		}
	}
};

CA1D.prototype.calculateField = function() {
	var rowCursor, cellCursor, ruleCursor;
	for (rowCursor = 1; rowCursor < this.field.height; ++rowCursor) {
		for (cellCursor = 0; cellCursor < this.field.width; ++cellCursor) {
			for (ruleCursor = 0; ruleCursor < this.rules.length; ++ruleCursor) {
				if (this.rules[ruleCursor].matches(this.field, rowCursor - 1, cellCursor)) {
					//~ if (this.rules[ruleCursor].result === 1) {
						//~ console.log(this.rules[ruleCursor]);
					//~ }
					this.field.setCell(rowCursor, cellCursor, this.rules[ruleCursor].result);
					continue;
				}
			}
		}
	}
}

function Field(width, height) {
	var i, j;

	this.width = width;
	this.height = height;
	this.field = [];

	// init field
	for (i = 0; i < this.width; ++i) {
		for (j = 0; j < this.height; ++j) {
			this.field.push(0);
		}
	}

	this.setCell(0, 8, 1);
	this.setCell(0, 10, 1);
	this.setCell(0, 30, 1);
	this.setCell(0, 71, 1);
}

Field.prototype.getCell = function(row, x) {
	if (x < 0) {
		return this.field[(row + 1) * this.width + x];
	}
	return this.field[row * this.width + x];
}

Field.prototype.setCell = function(row, x, value) {
	this.field[row * this.width + x] = value;
}

/**
 * defines a rule where fieldPart is projected to result
 **/
function Rule(fieldParts, result) {
	this.fieldParts = fieldParts;
	this.result = result;
}

/**
 * returns true if rule matches a given field part
 **/
Rule.prototype.matches = function(field, row, cellX) {
	var i;
	for	(i = 0; i < this.fieldParts.length; ++i) {
		if (field.getCell(row, cellX + this.fieldParts[i][0]) !== this.fieldParts[i][1]) {
			return false;
		}
	}

	return true;
};

function init() {
	var ca1D = new CA1D();
}