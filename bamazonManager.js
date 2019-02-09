//Require needed packages
const inquirer = require("inquirer");
const mysql = require("mysql");


//Connect to the bamazon mysql database
var conn = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "rivahweb",
  database: "bamazon"
});


//Function to close the app
function closeApp() {
  conn.end();
}


//Function to list all the products 
function showProd(){

    //Sql statement
    var sql = "select * from products";
    conn.query(sql, (err, res) => {

        //If error throw error
        if (err) throw err;

        //If response length is greater than zero
        if (res.length > 0) {

            //Show welcome message and products
            console.log("\nHere are all the current products and their associated information:");
            console.log("\n  ID | Name | Department | Price | Quantity In Stock");
            console.log("  --------------------------------------------------");
            for (i = 0; i < res.length; i++) {
                console.log('  ' +
                res[i].item_id +
                    " | " +
                    res[i].product_name +
                    " | " +
                    res[i].department_name +
                    " | " +
                    '$ '+ parseFloat(res[i].price) +
                    " | " +
                    res[i].stock_quantity
                );
            }   
        }
    //Back to the menu
    main();
    })
}


//Function to list all the low quantity products with quantity less than 5 in stock
function showLowProd(){

    //Sql statement
    var sql = "select * from products where stock_quantity < 5";
    var query = conn.query(sql, (err, res) => {

    //If error throw error
    if (err) throw err;

    //If response length is greater than zero
    if (res.length > 0) {

        //Show welcome message and products
        console.log("\nHere are LOW QUANTITY products and their associated information:");
        console.log("\n  ID | Name | Department | Price | Quantity In Stock");
        console.log("  --------------------------------------------------");
        for (i = 0; i < res.length; i++) {
            console.log('  ' +
            res[i].item_id +
                " | " +
                res[i].product_name +
                " | " +
                res[i].department_name +
                " | " +
                '$ '+ parseFloat(res[i].price) +
                " | " +
                res[i].stock_quantity
            )
            }
        //Back to the menu
        main();

    } else {
        //No low quantity products found
        console.log('No low quantity products were found.');
        main();
        } 
    })
}


//Function to add to current product quantity
function addProdQty(){
    
    //Promt to ask which product to add to and how much to add
    inquirer
    .prompt([
      {
        type: "input",
        name: "prodId",
        message: "\nWhich product ID would you like to add to ?",
        validate: (value)=> {
            var pass = value.match(/^\d+$/);
            if (pass) {
              return true;
            } else {
                return 'Please enter a number';
            }    
          }
      },
      {
        type: "input",
        name: "prodQty",
        message:"\nEnter the quantity that you would like to add? Enter 0 to start again or -1 to exit.",
        validate: (value)=> {
            var pass = value.match(/^-?\d*\.?\d+$/);
            if (pass) {
              return true;
            } else {
                return 'Please enter a number';
            }    
          }
      }])
    .then(function(res) {

      // based on their answers, restart if quatity is 0, exit if quantity is =1, or update quantity
      if (res.prodQty === '0') {
        main();
        } else if (res.prodQty === '-1') {
          console.log("Ok, come back again soon!");
          closeApp();
        } else {
            //Update the selected prod Id current quantity with the quantity entered
            //Get current quantity for the selected product id
            var sql = 'select stock_quantity from products where item_id =?';
            conn.query(sql,[res.prodId],(err,resp)=>{
                if (err) throw err;
                var curQty = resp[0].stock_quantity;
                var newQty = parseInt(curQty) + parseInt(res.prodQty);
                
                //Update the quantity
                var sql = 'update products set stock_quantity =? where item_id =?';
                conn.query(sql,[newQty,res.prodId],(err,res)=>{
                if (err) throw err;
                console.log('Product quantity updated successfully!');
                main();
                })
            
            })
        }
    })
}

//Function to add a new product
function addNewProd(){
    
    //Prompt for all needed product information
    inquirer
    .prompt([
      {
        type: "input",
        name: "product_name",
        message: "\nEnter new product name ?",
      },
      {
        type: "input",
        name: "department_name",
        message: "\nEnter new product department ?",
      },
      {
        type: "input",
        name: "price",
        message:"\nEnter the new product price ?",
        validate: (value)=> {
            var pass = value.match(/^-?\d*\.?\d+$/);
            if (pass) {
              return true;
            } else {
                return 'Please enter a number';
            }    
          }
      },
      {
        type: "input",
        name: "stock_quantity",
        message:"\nEnter the new product stock_quantity ?",
        validate: (value)=> {
            var pass = value.match(/^-?\d*\.?\d+$/);
            if (pass) {
              return true;
            } else {
                return 'Please enter a number';
            }    
          }
       
      }]).then(function(res){
        
            //Assign values from responses to variables used for updating table
            var newProdName = res.product_name;
            var newProdDept = res.department_name;
            var newProdPrice = res.price;
            var newProdQty = res.stock_quantity;

            //Create sql statement to updat the products table
            var sql = 'insert into products set ?';

            conn.query(sql,[{
                product_name: newProdName,
                department_name: newProdDept,
                price: newProdPrice,
                stock_quantity: newProdQty
            }],(err,res)=>{
                if (err) throw err;
                console.log('New product added successfully!')
                main();
            })
        
    })

}  


//Function to display menu to the manager
function main(){

    //This will show the manager and menu list for a selection 
    //Prompt for "View Products for Sale"
    //Prompt for "View Low Inventory"
    //Prompt for "Add to Inventory"
    //Prompt for "Add New Product"
    inquirer
    .prompt([
        {
        type: "list",
        name: "mgrAction",
        message: "\nWhat manager action would you like to perform?",
        choices: ["View Products for Sale", "View Low Qty Products", "Add to Inventory","Add New Product","Exit"]
        }
    ])
    .then(function(res){
        if (res.mgrAction === 'View Products for Sale') {
            showProd();
        } else if (res.mgrAction === 'View Low Qty Products') {
            showLowProd();
        } else if (res.mgrAction === 'Add to Inventory') {
            addProdQty();
        } else if (res.mgrAction === 'Add New Product') {
            addNewProd();
        } else if (res.mgrAction === 'Exit') {
            conn.end();
        }
        else {
        //Show error message
        console.log("*** Sorry, an invalid selection was made!");
        main();
        }      

    })
}


//Welcome splash
console.log('\n***********************************************');
console.log('*                                             *');
console.log('*            Welcome to BAMAZON               *');
console.log('*          You are a great manager !!         *');
console.log('*                                             *');
console.log('***********************************************');


//Program starts here
main();