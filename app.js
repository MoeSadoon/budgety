// BUDGET CONTROLLER
var budgetController = (function() {
    
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems: {
            exp: [],
            inc: [],
        },

        allTotals: {
            exp: 0,
            inc: 0
        }
    };

    // Makes anything within the returned object accessible outside the IIFE
    return {
        addItem: function(type, desc, val) {
            var newItem, ID;

            // If array of inc/exp is not empty, it sets the ID by going to the last element in array, getting its ID and +1 to it
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length -1].id + 1;
            }
            else {
                ID = 0
            }

            // Creates new item dependinng on whether its an expense or income
            if(type === 'exp') {
                newItem = new Expense(ID, desc, val);
            }
            else if (type === 'inc') {
                newItem = new Income(ID, desc, val);
            }

            // Pushes item to the relevant array depending on whether its inc/exp
            data.allItems[type].push(newItem);

            return newItem

        },
    }

})();

// UI CONTROLLER
var UIController = (function() {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, //will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: document.querySelector(DOMstrings.inputValue).value
             }
        },

        // Exposes the DOMstrings object to outer environments
        getDOMstrings: function() {
            return DOMstrings;
        }
    };

})();

// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {


    // When invoked, this makes all the event listeners ready
    const setUpEventListeners = () => {
        
        // Gaining access to DOMstrings from UIController
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem)

        // Adding to global environment since you can press enter anywhere
        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        })

    }

    const ctrlAddItem = () => {
        var input, newItem;
        // 1. Get input data
        input = UICtrl.getInput();
        
        // 2. Add item to the budget controller by taking input from UI
        newItem = budgetCtrl.addItem(input.type, input.description, input.value); 
    
        // 3. Add new item to the user interface
        // 4. Calculate the budget
        // 5. Display the budget on the UI
    };

    return {
        init: function() {
            console.log('Application has started');
            setUpEventListeners();
        }
    };

})(budgetController, UIController);

// This runs as soon as the application has started
controller.init();

