'use strict';

document.addEventListener("DOMContentLoaded", init, false);

function CA1D() {
	var i,j;

	this.rules = [];
	this.initRules();
	this.fieldWidth = 130;
	this.fieldHeight = 50;

	this.field = new Field(this.fieldWidth, this.fieldHeight);

	this.initVisuals();
	this.calculateField();
	this.redrawField();
}

CA1D.prototype.initRules = function() {
	this.rules.push(new Rule([[-1, 0], [0, 0], [1, 0]], 0));
	this.rules.push(new Rule([[-1, 0], [0, 0], [1, 1]], 0));
	//~ this.rules.push(new Rule([[-2, 0], [-1, 0], [0, 0], [1, 1]], 1));
	this.rules.push(new Rule([[-1, 0], [0, 1], [1, 0]], 1));
	this.rules.push(new Rule([[-1, 0], [0, 1], [1, 1]], 1));
	this.rules.push(new Rule([[-1, 1], [0, 0], [1, 0]], 1));
	this.rules.push(new Rule([[-1, 1], [0, 0], [1, 1]], 1));
	this.rules.push(new Rule([[-1, 1], [0, 1], [1, 0]], 1));
	//~ this.rules.push(new Rule([[-2, 1], [-1, 1], [0, 1], [1, 1], [2, 1]], 1));
	this.rules.push(new Rule([[-1, 1], [0, 1], [1, 1]], 0));
};

CA1D.prototype.getFieldCell = function(row, x) {
	return this.fieldCell(row * this.fieldWidth + x);
}

CA1D.prototype.initVisuals = function() {
	// draw field
	var instance = this;
	var i, j, row, table, ruleCursor, ruleDiv, ruleTable, ruleTr;
	var xOffsetCursor;

	table = d3.select('#field').append('table');
	for (i = 0; i < this.fieldHeight; ++i) {
		row = table.append('tr').attr('class', 'field-row');
		for (j = 0; j < this.fieldWidth; ++j) {
			row.append('td').attr('class', 'field-cell').text('').attr('row', i).attr('x', j);
		}
	}

	d3.selectAll('#field table .field-cell[row="0"]').on('click', function() {
		var x = +d3.select(this).attr('x');
		var oldState = instance.field.getCell(0, x);
		instance.field.setCell(0, x, +(!oldState));
		d3.select(this).classed({'black': !oldState});
		instance.setDirty(true);
	});

	// draw rules
	for (ruleCursor = 0; ruleCursor < this.rules.length; ++ruleCursor) {
		ruleDiv = d3.select('#rules .row').append('div').classed({'c1': true}).text(ruleCursor);
		ruleTable = ruleDiv.append('table').classed({'rule-table': true}).attr('rule-id', ruleCursor).attr('style', 'width: auto;');
		ruleTr = ruleTable.append('tr');

		for (xOffsetCursor = this.rules[ruleCursor].getMinXOffset(); xOffsetCursor <= this.rules[ruleCursor].getMaxXOffset(); ++xOffsetCursor) {
			ruleTr.append('td').classed({'field-cell' : true, 'black': this.rules[ruleCursor].getXOffsetState(xOffsetCursor)});
		}

		ruleTr = ruleTable.append('tr');

		// result line
		for (xOffsetCursor = this.rules[ruleCursor].getMinXOffset(); xOffsetCursor <= this.rules[ruleCursor].getMaxXOffset(); ++xOffsetCursor) {
			ruleTr.append('td').classed({'field-cell' : true, 'result': xOffsetCursor === 0, 'black': xOffsetCursor === 0 && this.rules[ruleCursor].result});
		}

		ruleTable.on('click', function () {
				var ruleId = d3.select(this).attr('rule-id');
				instance.rules[ruleId].result = +(!instance.rules[ruleId].result);
				d3.select('#rules table[rule-id="' + ruleId + '"] .result').classed({'black': instance.rules[ruleId].result});
				instance.setDirty(true);
			});
	}

	// redraw button
	d3.select('#redraw').on('click', function () {
			instance.calculateField();
			instance.redrawField();
			instance.setDirty(false);
		});

	// shuffle first row button
	d3.select('#shuffleRow').on('click', function () {
			var x, newState, ratio;
			for (x = 0; x < instance.field.width; ++x) {
				ratio = +d3.select('#shuffleRowBlackRatio').node().value;
				newState = Math.random() > ratio ? 1 : 0;
				instance.field.setCell(0, x, newState);
				d3.select('#field table .field-cell[row="0"][x="' + x + '"]').classed({'black': newState});
			}
			instance.setDirty(true);
		});

	// shuffle rules
	d3.select('#shuffleRules').on('click', function () {
			var ruleCursor, newState;
			for (ruleCursor = 0; ruleCursor < instance.rules.length; ++ruleCursor) {
				newState = Math.random() > 0.5 ? 1 : 0;
				instance.rules[ruleCursor].result = newState;
				d3.select('#rules table[rule-id="' + ruleCursor + '"] .result').classed({'black': instance.rules[ruleCursor].result});
			}
			instance.setDirty(true);
		});
};

CA1D.prototype.setDirty = function(dirty) {
	d3.select('#redraw').classed({'btn-black': dirty});
};

CA1D.prototype.redrawField = function() {
	// draw field
	var i, j, oldState;
	for (i = 0; i < this.fieldHeight; ++i) {
		for (j = 0; j < this.fieldWidth; ++j) {
			oldState = +d3.select('.field-cell[row="' + i + '"][x="' + j + '"]').classed('black');
			if (oldState !== this.field.getCell(i, j)) {
				d3.select('.field-cell[row="' + i + '"][x="' + j + '"]').classed({'black' : this.field.getCell(i, j)});
			}
		}
	}
};

CA1D.prototype.calculateField = function() {
	var rowCursor, cellCursor, ruleCursor;
	for (rowCursor = 1; rowCursor < this.field.height; ++rowCursor) {
		for (cellCursor = 0; cellCursor < this.field.width; ++cellCursor) {
			for (ruleCursor = 0; ruleCursor < this.rules.length; ++ruleCursor) {
				if (this.rules[ruleCursor].matches(this.field, rowCursor - 1, cellCursor)) {
					this.field.setCell(rowCursor, cellCursor, this.rules[ruleCursor].result);
					break;
				}
			}
		}
	}
};

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
}

Field.prototype.getCell = function(row, x) {
	if (x < 0) {
		return this.field[(row + 1) * this.width + x];
	} else if (x > this.width - 1) {
		return this.field[(row - 1) * this.width + x];
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

Rule.prototype.getMinXOffset = function() {
	var i, min;
	min = this.fieldParts[0][0];
	for	(i = 1; i < this.fieldParts.length; ++i) {
		min = Math.min(min, this.fieldParts[i][0]);
	}

	return min;
}

Rule.prototype.getMaxXOffset = function() {
	var i, max;
	max = this.fieldParts[0][0];
	for	(i = 1; i < this.fieldParts.length; ++i) {
		max = Math.max(max, this.fieldParts[i][0]);
	}

	return max;
}

Rule.prototype.getXOffsetState = function(xOffset) {
	var i;
	for	(i = 0; i < this.fieldParts.length; ++i) {
		if (this.fieldParts[i][0] === xOffset) {
			return this.fieldParts[i][1];
		}
	}

	return max;
}

function init() {
	var ca1D = new CA1D();
}
