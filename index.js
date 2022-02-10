"use strict";


var stack = [];
var heap = new Array(100);
function interpret(script) {

	function error(i, instruction, message) {
		console.error("Runtime error on instruction " + i + " (\"" + instruction + "\"): " + message);
	}

	var i = 0;
	var total_i = 0;
	while(true) {
		if (i >= script.length) {
			break;
		}
		if (total_i >= 200000) {
			error(i, instruction, "Runtime limit exceeded");
			return;
		}
		//console.log("DEBUG", i, script[i], stack);
		var cmd = script[i];
		var instruction;
		if(Array.isArray(cmd)) {
			instruction = cmd[0];
		} else {
			instruction = cmd;
		}
		// TODO: check if instruction is string
		switch (instruction) {
			case 'literal':
				stack.push(cmd[1]);
				break;
			case 'store':
				heap[stack.pop()] = stack.pop();
				break;
			case 'load':
				stack.push(heap[stack.pop()]);
				break;
			case 'print':
				console.log(stack.pop());
				break;
			case 'relativeJumpIfFalse':
				var first = stack.pop();
				if(typeof first !== "boolean") {
					error(i, instruction, "Type mismatch for jump condition (got " + typeof first + ", expected boolean)");
					return;
				}
				if(first == 0) {
					i += cmd[1]
					if (i >= script.length) {
						error(i, instruction, "Jumped past end of program");
						return;
					}
					if (i < 0) {
						error(i, instruction, "Jumped before start of program");
						return;
					}
				}
				break;
			case 'relativeJump':
				i += cmd[1]
				if (i >= script.length) {
					error(i, instruction, "Jumped past end of program");
					return;
				}
				if (i < 0) {
					error(i, instruction, "Jumped before start of program");
					return;
				}
				break;
			case '+':
				var second = stack.pop();
				var first = stack.pop();
				if(typeof second !== typeof first) {
					error(i, instruction, "Type mismatch for addition operands (got " + typeof second + " and " + typeof first + ", expected string and string or number and number)");
					return;
				}
				stack.push(first + second);
				break;
			case '>':
				var second = stack.pop();
				var first = stack.pop();
				if(typeof second !== "number") {
					error(i, instruction, "Type mismatch for comparison operand (got " + typeof second + ", expected number)");
					return;
				}
				if(typeof first !== "number") {
					error(i, instruction, "Type mismatch for comparison operand (got " + typeof first + ", expected number)");
					return;
				}
				if(first > second) {
					stack.push(true);
				} else {
					stack.push(false);
				}
				break;
			case '<':
				var second = stack.pop();
				var first = stack.pop();
				if(typeof second !== "number") {
					error(i, instruction, "Type mismatch for comparison operand (got " + typeof second + ", expected number)");
					return;
				}
				if(typeof first !== "number") {
					error(i, instruction, "Type mismatch for comparison operand (got " + typeof first + ", expected number)");
					return;
				}
				if(first < second) {
					stack.push(true);
				} else {
					stack.push(false);
				}
				break;
			case '%':
				var second = stack.pop();
				var first = stack.pop();
				if(typeof second !== "number") {
					error(i, instruction, "Type mismatch for modulo operand (got " + typeof second + ", expected number)");
					return;
				}
				if(typeof first !== "number") {
					error(i, instruction, "Type mismatch for modulo operand (got " + typeof first + ", expected number)");
					return;
				}
				stack.push(first % second);
				break;
			case '==':
				var second = stack.pop();
				var first = stack.pop();
				if(typeof second !== typeof first) {
					error(i, instruction, "Type mismatch for comparison operands (got " + typeof second + " and " + typeof first + ", expected two of same type)");
					return;
				}
				if(first === second) {
					stack.push(true);
				} else {
					stack.push(false);
				}
				break;
			default:
				error(i, instruction, "Illegal instruction");
				return;
		}
		i++;
		total_i++;
	}
	return total_i;
}


const parser = require('./parser.js');

let scriptText = `
for(var i = 1; i < 100; i = i + 1;) {
	var output = "";
	
	if (0 == i % 3) {
		output = output + "Fizz";
	}
	
	if (0 == i % 5) {
		output = output + "Buzz";
	}
	
	if (output == "") {
		print i;
	} else {
		print output;
	}
}
`;

let bytecode = parser.parse(scriptText);

console.log("*** Script has " + bytecode.length + " instructions");


let total_cycles = interpret(bytecode);

console.log("*** Total instructions executed: " + total_cycles);


// Uncomment below line to print bytecode in console
//console.log(bytecode);