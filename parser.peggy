{
	var constants = {};
    var addresses = [];
}


start
= statements

statements
= stmts:(statement _)* {
	var result = [];
    stmts.forEach(function(stmt) {
    	if(stmt[0] === undefined) {
        	return;
        }
        if(Array.isArray(stmt[0])) {
        	result.push(...stmt[0]);
        } else {
        	result.push(stmt[0]);
        }
    });
    return result;
}

statement
= _ stmt:(
	//statement_const /
    //statement_getconst /
	statement_var /
	statement_print /
    statement_if_elseif /
    statement_if_else /
    statement_if /
    statement_for /
    statement_while /
    statement_assignment
) { return stmt; }

statement_var
= "var" _ name:identifier _ "=" _ value:expression ";" {
	addresses.push(name);
    return [
        ...value,
    	["literal", addresses.indexOf(name)],
        "store"
    ];
	//return undefined;
}

statement_assignment
= name:identifier _ "=" _ value:expression ";" {
    if( addresses.indexOf(name) == -1) {
    	error("Undefined variable " + id);
    }
    return [
        ...value,
    	["literal", addresses.indexOf(name)],
        "store"
    ];
	//return undefined;
}

statement_print
= "print" _ value:expression ";" {
    return [
        ...value,
        "print"
    ];
	//return undefined;
}

statement_if_else
= "if" _ "(" _ condition:expression _ ")" _ "{" _ stmts1:statements _ "}" _
  "else" _ "{" _ stmts2:statements _ "}" {
	return [
    	...condition,
        ["relativeJumpIfFalse", stmts1.length + 1],
    	...stmts1,
        ["relativeJump", stmts2.length],
        ...stmts2
    ];
}

statement_if_elseif
= "if" _ "(" _ condition:expression _ ")" _ "{" _ stmts1:statements _ "}" _
  "else" _ if2:(statement_if_elseif / statement_if_else / statement_if) {
	return [
    	...condition,
        ["relativeJumpIfFalse", stmts1.length + 1],
    	...stmts1,
        ["relativeJump", if2.length],
        ...if2
    ];
}

statement_if
= "if" _ "(" _ condition:expression _ ")" _ "{" _ stmts:statements _ "}" {
	return [
    	...condition,
        ["relativeJumpIfFalse", stmts.length],
    	...stmts
    ];
}

statement_while
= "while" _ "(" _ condition:expression _ ")" _ "{" _ stmts:statements _ "}" {
	return [
    	...condition,
        ["relativeJumpIfFalse", stmts.length + 1],
    	...stmts,
        ["relativeJump", (condition.length + stmts.length + 2) * -1]
    ];
}

statement_for
= "for" _ "(" _ stmt1:statement _ condition:expression ";" _ stmt2:statement _ ")" _ "{" _ body:statements _ "}" {
	return [
    	...stmt1,
    	...condition,
        ["relativeJumpIfFalse", body.length + stmt2.length + 1],
    	...body,
        ...stmt2,
        ["relativeJump", (condition.length + body.length + stmt2.length + 2) * -1]
    ];
}

expression
=
  (
  	exp1:primary _ oper:("+" / "==" / ">" / "<" / "%") _ exp2:expression
    {
    	return [...exp1, ...exp2, oper];
    }
  ) /
  primary

primary
= 
  (val:string { return [["literal", val]]; }) /
  (val:number { return [["literal", val]]; }) /
  (val:boolean { return [["literal", val]]; }) /
  (
  	id:identifier
  	{
    	if( addresses.indexOf(id) == -1) {
        	error("Undefined variable " + id);
        }
    	return [["literal", addresses.indexOf(id)], "load"];
    }
  )

/*statement_const
= "const" _ name:identifier _ "=" _ value:string {
	constants[name] = value;
	return undefined;
}
statement_getconst
= "getconst" _ name:identifier {
	return constants[name];
}*/

string "String"
  = "\"" letters:[^"]* "\"" { return letters.join(""); }

number "Number"
  = 
    ("-"? ("0" / ([1-9] [0-9]*)) "." [0-9]+ ([eE] [+\-]? [0-9]+)? { return Number.parseFloat(text()); }) /
    ("-"? ("0" / ([1-9] [0-9]*)) { return Number.parseInt(text()); })

boolean "Boolean"
  =
    ("true" { return true; }) /
    ("false" { return false; })

identifier "Identifier"
  = $([A-Za-z_] [A-Za-z0-9_]*)

_ "whitespace"
  = [ \t\n\r]*
