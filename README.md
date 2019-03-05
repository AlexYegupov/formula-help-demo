# formula-help-demo

# Task
The general task is to provide a functionality, which is comparable to the google sheets function help, while you are typing a formula.

It must be implemented using vanilla javascript for now. We are using react for the application, but not for the spreadsheet component. So typing happens within a contenteditable div. Whenever you observe, that something like a function is being entered, the appropriate info below is to be shown. First the general function info and then the infos concerning the argument, where the user is typing at.

Don’t worry about parsing too much. We do have the parser in place, but here it wont help much, as you need to identify the function name probably from the first letters entered before something valid is available. Its more like an extended autocomplete functionality. Have a look at the google implementation, if in doubt. It would be good enough as a first step, if the popup shows after entering the equal (+ or – or * or /) sign and starting with a function name. Later we can decide, how we interact, if the user starts typing complex formulas.

The function syntax has to be retrieved from a json, we attach (at least partially, its missing the argument description now).  It needs to adapt to a UI language.

Simple google-spreadsheets help formula demo.

# Demo
https://alexyegupov.github.io/formula-help-demo

# TODO
The following features could be implemented by requirement:

 - allow space after function name: SUM |(1,2,3)
 - make "⏴" as active param marker instead of disc and smooth moving
 - load fonts statically (not from cdn)
 - editable div syntax is not highlighted (it could be implemented via invisible text & background div but looks out of scope of this task)
