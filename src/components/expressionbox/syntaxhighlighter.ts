

// WARNING: LEGACY (ish) CODE
// MAY BE CRINGE

// WARNING: CURSED REGEX

const ignoreTagsPreproc = /(\<.*?\>.*?\<.*?\>)/.source
let replaceIgnoreTags = function replaceIgnoreTags( text: string, innerRegex: RegExp, replace: (...args: string[]) => string ){
    
    let matcher = new RegExp(`${ignoreTagsPreproc}|${innerRegex.source}`,"g")
    return text.replace(matcher, function(){
        let shiftedArguments = [...arguments].slice(2,arguments.length-2); // we'll pass these on to replace
        if( !arguments[1] ){
            return replace.call(globalThis, ...shiftedArguments)
        }
        else{
            return arguments[0]
        }
    })

}

export const E2SyntaxHighlighter = {

    isLetter(txt: string) {
        return txt.toUpperCase() != txt.toLowerCase() || txt=="_"
    },

    isUppercase(txt: string) {
        return txt.toUpperCase() == txt && txt.toLowerCase() != txt
    },

    isLowercase(txt: string) {
        return txt.toUpperCase() != txt && txt.toLowerCase() == txt
    },

    isNumber(txt: string) {
        return !isNaN( parseInt(txt) )
    },

    types: [
        "entity",
        "quaternion",
        "angle",
        "vector2",
        "vector4",
        "number",
        "bone",
        "array",
        "table",
        "ranger",
        "string",
        "vector",
        "matrix",
    ],

    // symbol, highlightWholeLine
    directives: {
        "@name":    true,
        "@inputs":  false,
        "@outputs": false,
        "@persist": false,
        "@trigger": true,
        "@model":   true,
        "@strict":  true,
    },

    keywords: [
        "for",
        "if",
        "while",
        "else",
        "break",
        "local",
        "function",
        "continue",
        "return",
        "try",
        "throw",
        "catch",
        "event"
    ],

    highlightTypes(txt: string) {
        for (const type of this.types) {
            let matcher = new RegExp(`([,:])${type}([\\]\\s\\),])`,"gm");
            txt = txt.replace(matcher,`$1<e2type>${type}</e2type>$2`); // general
    
            matcher = new RegExp(`(function\\s*?)${type}(\\s)`,"gm");
            txt = txt.replace(matcher,`$1<e2type>${type}</e2type>$2`); // function return type
    
            matcher = new RegExp(`(function\\s*?.*?)${type}(:)`,"gm");
            txt = txt.replace(matcher,`$1<e2type>${type}</e2type>$2`); // function type:thisKind()
        }
        return txt;
    },

    highlightDirectives(txt: string) {
        for (const [dir, wholeLine] of Object.entries(this.directives) ){
            if(wholeLine){
                let matcher = new RegExp(`(^|\n)(${dir}.*?)(\n)`,"gm")
                txt = replaceIgnoreTags(txt,matcher,(a,b,c) => `${a}<e2dir>${b}</e2dir>${c}`)
            }
            else{
                txt = txt.replaceAll(dir,`<e2dir>${dir}</e2dir>`);
            }
        }
        return txt;
    },

    highlightStringsAndComments(txt: string){
        const explodedtext = txt.split("");
        let len = explodedtext.length;
        let comment = false;
        let inside = false;
        let escape = false;

        for (let t = 0; t < len; t++) {
            let entry = explodedtext[t];

            if ( !inside && !comment && entry == '#' && txt.substr(t,8)!="#include" && explodedtext[t+1]!="[" && explodedtext[t-1]!="]" ) {
                comment = true;
                explodedtext[t] = `<e2comment>${entry}`;
            }
            if( comment && entry == "\n" ){
                comment = false;
                explodedtext[t] = `</e2comment>${entry}`;
            }

            if ( escape ){ 
                escape = false;
                continue
            }
            if ( entry == '\\' ) {
                escape = true;
                continue;
            }
            if ( entry == '"' && !comment ) {
                inside = !inside;
                if (inside) {
                    entry = `<e2string>${entry}`
                } 
                else {
                    entry = `${entry}</e2string>`
                } 
                explodedtext[t] = entry;
            }
        }

        txt = explodedtext.join("");
        txt = replaceIgnoreTags(txt, /(#include)/, () => "<e2key>#include</e2key>")
        txt = txt.replaceAll("#[","<e2comment>#[");
        txt = txt.replaceAll("]#","]#</e2comment>");

        return txt;
    },

    highlightMulti(txt: string) {
        const explodedtext = txt.split("");
        let len = explodedtext.length;
        let stage = 0;
        let last = 0;
        let infunction = 0;
        let ready = false;
        for (let t = 0; t < len; t++) {
            
            let entry = explodedtext[t];
    
            if ((stage == 0) && (entry == "<")) { // html opening tag?
                // logSub(last,t,explodedtext,stage)
                last=t
                stage++;
            }
            if ((stage == 1) && (entry == ">")) { // close of above tag?
                // logSub(last,t,explodedtext,stage)
                last=t
                stage++;
            }
            if ((stage == 2) && (entry == "<")) { // html opening tag?
                // logSub(last,t,explodedtext,stage)
                last=t
                stage++;
            }
            if ((stage == 3) && (entry == ">")) { // close of above tag?
                // logSub(last,t,explodedtext,stage)
                stage = 0;
                last=t
                ready = false;
            }
    
            if (infunction == 0) {
                if (this.isLowercase(entry) && stage==0 && ready) { // definitely a function
                    infunction = 1;
                    entry = "<e2func>" + entry;
                }
                if (this.isNumber(entry) && stage==0 && ready) { // number
                    infunction = 2;
                    entry = "<e2num>" + entry;
                }
            } 
            else if (!this.isLetter(entry) && !this.isNumber(entry)) { // found the end of the thing!
                if (infunction == 1) {
                    entry = "</e2func>" + entry; // close it off and continue
                }
                else if (infunction == 2) {
                    entry = "</e2num>" + entry; // close it off and continue
                }
                infunction = 0;
            }
    
            explodedtext[t] = entry;
            ready = true;
        }
        return explodedtext.join("")
    },

    highlightVariables(txt: string) {

        let stage = 0;
        let explodedtext = txt.split("");
        let len = explodedtext.length;
        let insideVariable = false;
        let outsideVariable = false;
        let prevInside = false;
        let ready = false;
        for (let t = 0; t < len; t++) {
            
            let entry = explodedtext[t];
    
            if ((stage == 0) && (entry == "<")) { // html opening tag?
                ready = true;
                stage++;
            }
            if ((stage == 1) && (entry == ">")) { // close of above tag?
                stage++;
            }
            if ((stage == 2) && (entry == "<")) { // html opening tag?
                stage++;
            }
            if ((stage == 3) && (entry == ">")) { // close of above tag?
                stage = 0;
                ready = false; // wait 1 iteration to purge the buffer of any tags
            }
    
            if((stage==0) && ready){
                prevInside = insideVariable;
    
                if (!insideVariable) {
                    if (this.isLowercase(entry)) {
                        outsideVariable = true;
                    }
                    if (!this.isLetter(entry)) {
                        outsideVariable = false;
                    }
                }
    
                if (!outsideVariable) {
                    if (this.isUppercase(entry)) {
                        insideVariable = true;
                    }
                    if (!this.isLetter(entry) && !this.isNumber(entry)) {
                        insideVariable = false;
                    }
                }
    
                if ( (insideVariable != prevInside) ) { 
                    if (!prevInside ) {
                        entry = "<e2var>" + entry;
                    }
                    if (prevInside) {
                        entry = "</e2var>" + entry;
                    }
                }
            }
            else if((stage==1 && ready)){ // edge case: end of line
                if (insideVariable) {
                    entry = "</e2var>" + entry;
                }
                prevInside = false;
                insideVariable = false;
            }
            explodedtext[t] = entry;
            ready = stage==0;
    
        }
        txt = explodedtext.join("");
        return txt;
    },

    highlightKeywords(txt: string){
        txt = replaceIgnoreTags(txt, /foreach/, () => "___FOREACH"); // for and foreach overlap
        for (const keyword of this.keywords) {
            txt = replaceIgnoreTags(txt, new RegExp(keyword), () => `<e2key>${keyword}</e2key>`);
        }
        txt = txt.replaceAll("___FOREACH", "<e2key>foreach</e2key>");
        return txt
    }

}

/**
 * Apply E2 Syntax Highlighting to an element's contents
 */
export function applySyntaxHighlight(elem: HTMLElement) {
    let txt = elem.innerText; // innerhtml will break some characters
    txt = txt.replaceAll("<","\u1000") // use weird sentinels we can replace at the end
    txt = txt.replaceAll(">","\u1001")
    txt = E2SyntaxHighlighter.highlightDirectives(txt);
    txt = E2SyntaxHighlighter.highlightStringsAndComments(txt);
    txt = E2SyntaxHighlighter.highlightTypes(txt);
    txt = E2SyntaxHighlighter.highlightVariables(txt);
    txt = E2SyntaxHighlighter.highlightKeywords(txt);
    txt = E2SyntaxHighlighter.highlightMulti(txt); // has to be last
    txt = txt.replaceAll("\u1000","&lt;")
    txt = txt.replaceAll("\u1001","&gt;")
    elem.innerHTML = txt;
}

