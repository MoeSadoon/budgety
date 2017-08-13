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

    const calculateTotal = (type) => {
        var sum = 0;

        data.allItems[type].forEach(function(element) {
            sum += element.value;
        });
        // Store sum in data all totals object
        data.allTotals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: [],
        },

        allTotals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
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

        calculateBudget: function() {
            // Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate the budget : income - expenses
            data.budget = data.allTotals.inc - data.allTotals.exp;

            // Calculate the percentage of income that we spent
            if(data.allTotals.inc > 0) {
                data.percentage = Math.round((data.allTotals.exp / data.allTotals.inc) * 100);
            }
            else {
                data.percentage = -1;
            }
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.allTotals.inc,
                totalExp: data.allTotals.exp,
                percentage: data.percentage
            }
        },

        testing: function() {
            return data;
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
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list'

    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, //will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
             }
        },

        // Exposes the DOMstrings object to outer environments
        getDOMstrings: function() {
            return DOMstrings;
        },

        addListItem: function(obj, type) {
            var html, newHtml, element;

            // Create HTML string for income/expense item with placeholder text wrapped in '%_%'
            if(type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = `<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div>
                <div class="right clearfix"><div class="item__value">%value%</div>
                <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline">
                </i></button></div></div></div>`;
            }
            else if(type === 'exp') {
                element = DOMstrings.expenseContainer;
                html = `<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div>
                <div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div>
                <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div></div></div>`;
            }

            // Replace Placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            // Insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },     

        clearInput: function() {
            // Returns array-like structure of inputs
            var fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            // Convert array-like structure into an actual array
            // We do this by tricking the slice prototype function of the Array function constructor into thinking 'inputs' is an array by using 'call'
            var fieldsArr = Array.prototype.slice.call(fields);

            // Use forEach ot set every field in the fields array back to blank
            fieldsArr.forEach(function(element) {
                element.value = '';
            })

            // put focus back on description field:
            fieldsArr[0].focus();
        },
        
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

    const updateBudget = () => {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        console.log(budget);
    };

    const ctrlAddItem = () => {
        var input, newItem;
        // 1. Get input data
        input = UICtrl.getInput();

        if(!input.description) {
            const descError = 'Please provide a description';
            alert(descError);
            throw descError;
        }
        if(isNaN(input.value) || !input.value > 0) {
            const valError = 'Please provide a proper value';
            alert(valError);
            throw valError;
        }

        
        // 2. Add item to the budget controller by taking input from UI
        newItem = budgetCtrl.addItem(input.type, input.description, input.value); 
    
        // 3. Add new item to the user interface
        UICtrl.addListItem(newItem, input.type);

        // 4. Clear in input fields
        UICtrl.clearInput();

        // 5. Calculate and update budget
        UICtrl + updateBudget();
 
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

