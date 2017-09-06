// BUDGET CONTROLLER
const budgetController = (function () {

    class budgetItem {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
        }
    }

    class Expense extends budgetItem {
        constructor(id, description, value) {
            super(id, description, value);
            this.percentage = -1;
        }
    };

    Expense.prototype.calculatePercentage = function (totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }

    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };


    class Income extends budgetItem {
        constructor(id, description, value) {
            super(id, description, value);
        }
    }

    const calculateTotal = (type) => {
        let sum = 0;

        data.allItems[type].forEach(function (element) {
            sum += element.value;
        });
        // Store sum in data all totals object
        data.allTotals[type] = sum;
    };

    const data = {
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
        addItem: function (type, desc, val) {
            let newItem, ID;

            // If array of inc/exp is not empty, it sets the ID by going to the last element in array, getting its ID and +1 to it
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else {
                ID = 0
            }

            // Creates new item dependinng on whether its an expense or income
            if (type === 'exp') {
                newItem = new Expense(ID, desc, val);
            }
            else if (type === 'inc') {
                newItem = new Income(ID, desc, val);
            }

            // Pushes item to the relevant array depending on whether its inc/exp
            data.allItems[type].push(newItem);

            return newItem

        },

        deleteItem: function (type, id) {
            let ids, index;
            // Use the map function to create an array of all the IDs
            ids = data.allItems[type].map(function (current) {
                return current.id;
            })

            // Find the index of the item you want to delete
            if (index !== -1) {
                index = ids.indexOf(id);
            }

            // Remove that item from the data array using the splice method, providing the index and no. of elements you want to remove (i.e 1)

            data.allItems[type].splice(index, 1);
        },

        calculateBudget: function () {
            // Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate the budget : income - expenses
            data.budget = data.allTotals.inc - data.allTotals.exp;

            // Calculate the percentage of income that we spent
            if (data.allTotals.inc > 0) {
                data.percentage = Math.round((data.allTotals.exp / data.allTotals.inc) * 100);
            }
            else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function () {
            // Returns an array of percentages for each expense
            data.allItems.exp.forEach(function (current) {
                current.calculatePercentage(data.allTotals.inc);
            })
        },

        getPercentages: function () {
            let percentages = data.allItems.exp.map(function (current) {
                return current.getPercentage();
            })
            return percentages;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.allTotals.inc,
                totalExp: data.allTotals.exp,
                percentage: data.percentage
            }
        },

        testing: function () {
            return data;
        },

    }

})();

// UI CONTROLLER
const UIController = (function () {

    const DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'

    };

    const formatNumber = (num, type) => {
        let numSplit, int, dec;
        // + / - before the number depending on the type
        // exactly 2 decimal points
        // commas seperating the thousands

        // e.g 2310.4567 => + 2,310.46
        // e.g 2000 => 2,000

        // Makes number absolute (eg removes minus sign)
        num = Math.abs(num);
        // A method belonging to the Number prototype, converts to 2 decimal places but returns a STRING
        num = num.toFixed(2);

        // Splits this value string into two parts - the integer part and the decimal part and stores them in an array
        numSplit = num.split('.')

        // The first part, ie the integer part
        int = numSplit[0];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        };

        // The decimal part
        dec = numSplit[1]

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    const nodeListForEach = (list, callback) => {
        for (let i = 0; i < list.length; i++) {
            callback(list[i], i)
        }
    };


    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, //will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        // Exposes the DOMstrings object to outer environments
        getDOMstrings: function () {
            return DOMstrings;
        },

        addListItem: function (obj, type) {
            let html, newHtml, element;

            // Create HTML string for income/expense item with placeholder text wrapped in '%_%'
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = `<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div>
                <div class="right clearfix"><div class="item__value">%value%</div>
                <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline">
                </i></button></div></div></div>`;
            }
            else if (type === 'exp') {
                element = DOMstrings.expenseContainer;
                html = `<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div>
                <div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div>
                <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div></div></div>`;
            }

            // Replace Placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListItem: function (selectorID) {

            // JS is weird, to remove child you have to select parent element then call removeChild() on it.
            const el = document.getElementById(selectorID);

            el.parentNode.removeChild(el);
        },

        clearInput: function () {
            // Returns array-like structure of inputs
            const fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            // Convert array-like structure into an actual array
            // We do this by tricking the slice prototype function of the Array function constructor into thinking 'inputs' is an array by using 'call'
            const fieldsArr = Array.prototype.slice.call(fields);

            // Use forEach ot set every field in the fields array back to blank
            fieldsArr.forEach(function (element) {
                element.value = '';
            })

            // put focus back on description field:
            fieldsArr[0].focus();
        },

        displayBudget: function (obj) {
            let type;

            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            document.querySelector(DOMstrings.percentageLabel).textContent = formatNumber(obj.percentage, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }
            else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';

            }
        },

        displayPercentages: function (percentages) {
            let fields;

            // This returns a LIST of NODEs:
            fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            //Create our own custom function that mimics the 'forEach' function since its not available for lists

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                }
                else {
                    current.textContent = '---';
                }

            });

        },

        displayMonth: function () {
            let now, month, year;

            // Creates new date object
            now = new Date();

            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

            // This returns a binary index value (eg 0 = January, 1 = February, etc)
            month = now.getMonth()

            // This returns the year
            year = now.getFullYear();


            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;


        },

        changeType: function () {
            let fields;

            // Creates a node list
            fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        }

    };

})();

// GLOBAL APP CONTROLLER
const controller = (function (budgetCtrl, UICtrl) {


    // When invoked, this makes all the event listeners ready
    const setUpEventListeners = () => {

        // Gaining access to DOMstrings from UIController
        const DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem)

        // Adding to global environment since you can press enter anywhere
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        // Delegate to container element that holds both income and expense items
        // This is to avoid having to add event listener to every individual income/expense item
        // Made possible thanks to EVENT BUBBLING (event propagates from target to root)

        document.querySelector(DOM.container).addEventListener('click', ctrDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);


    }

    const updateBudget = () => {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        let budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    const updatePercentages = () => {
        // 1. Calculate the percentages
        budgetCtrl.calculatePercentages();

        // 2. Read the percentages from the budget controller
        const percentages = budgetCtrl.getPercentages();

        // 3. Display the percentages on the UI
        UICtrl.displayPercentages(percentages);
    }

    const ctrlAddItem = () => {
        let input, newItem;
        // 1. Get input data
        input = UICtrl.getInput();

        if (!input.description) {
            const descError = 'Please provide a description';
            alert(descError);
            throw descError;
        }
        if (isNaN(input.value) || !input.value > 0) {
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

        // 6. Calculate and update percentages
        updatePercentages();

    };

    const ctrDeleteItem = (event) => {
        let itemID, splitID, type, id;

        // Traverse up the DOM from the click target to the delete target's id (ie the whole income/expense item)
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            // Split itemID at '-', returning an array containing 'inc' and '0;
            splitID = itemID.split('-');

            type = splitID[0];

            id = parseInt(splitID[1]);
        }

        // 1. Delete item from the data structure
        budgetCtrl.deleteItem(type, id);

        // 2. Delete item from the UI
        UIController.deleteListItem(itemID);

        // 3. Update and show the budget
        updateBudget();

        // 4. Calculate and update the perentages
        updatePercentages();
    }

    return {
        init: function () {
            console.log('Application has started');

            // Ensures all values on the UI are set to 0 everytime the application has started
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });

            UICtrl.displayMonth();

            setUpEventListeners();
        }
    };

})(budgetController, UIController);

// This runs as soon as the application has started
controller.init();

