// BUDGET CONTROLLER
var budgetController = (function() {
    // some code
})();

// UI CONTROLLER
var UIController = (function() {
    // some code
})();

// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

    const ctrlAddItem = () => {
        // 1. Get input data
        // 2. Add item to the budget controller
        // 3. Add new item to the user interface
        // 4. Calculate the budget
        // 5. Display the budget on the UI

        console.log("adding item");
    }
    document.querySelector('.add__btn').addEventListener('click', ctrlAddItem)


    // Adding to global environment since you can press enter anywhere
    document.addEventListener('keypress', function(event) {
        if (event.keyCode === 13 || event.which === 13) {
            ctrlAddItem();
        }
    })

})(budgetController, UIController);


//