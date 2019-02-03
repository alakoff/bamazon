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

//Function to update the product quantity
function updateProd(prodId,prodQty,stockQty) {
    var newStockQty = stockQty - prodQty;
    var sql = 'update products set stock_quantity =? where item_id =?';
    conn.query(sql,[newStockQty,prodId],(err,res)=>{
        if (err) throw err;
        console.log('\nProduct quantity updated successfully!');    
    })
}


//Function to buy the product
function buyProd(prodId,prodQty) {

    //Get quantity and price for prodId, if stock quantity is less than prodQty then can't sell it
    var sql = 'select stock_quantity,price from products where item_id = ?';
    conn.query(sql,[prodId],(err,res)=>{

        //Throw error if one encountered
        if (err) throw err;

        //Check to see if query response length was greater than zero
        if (res.length>0) {

            //Variables to pass to update item quantity function
            var stockQty = res[0].stock_quantity;
            var stockPrice = parseFloat(res[0].price);

            if (stockQty < prodQty) {
                //Can't sell more than we have
                console.log("\n *** Sorry, we don't have that much in stock, please adjust your quantity. *** ");

                //Back to main page
                main();

            } else {
                //Complete the transaction
                console.log('\nCompleting your transaction, please wait one moment ...');

                //Show total purchase
                var totalPurchase = prodQty * stockPrice;
                console.log('\n *** Your total purchase was $',totalPurchase, '***');

                //Update item quantity
                updateProd(prodId,prodQty,stockQty);

                //Back to main page
                main();
            }
        } else {

            //General catch all message, for no error but response is not greater than 0
            console.log('\n*** Encountered an invalid item id or quantity, please try again ... ***');
            main();
        }
    })
  }


//Select and display products available
function main() {

    //Sql statement
    var sql = "select * from products where stock_quantity > 0";
    var query = conn.query(sql, (err, res) => {
    
    //If error throw error
    if (err) throw err;

    //If response length is greater than zero
    if (res.length > 0) {
    
        //Show welcome message and products
    console.log("\nHere are the currently available products:");
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
    customerPrompt();
    } else {
    
        //No products with quantity greater than zero, show message
    console.log(" *** Sorry, we have no products to sell ... yikes ! *** ");
    closeApp();
    }
    });
}

//Prompts customer for product ID and quantity to buy
function customerPrompt() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "prodId",
        message: "\nWhich product ID would you like to buy ?",
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
        message:"\nEnter the quantity that you would like to buy? Enter 0 to start again or -1 to exit.",
        validate: (value)=> {
            var pass = value.match(/^\d+$/);
            if (pass) {
              return true;
            } else {
                return 'Please enter a number';
            }    
          }
      }])
    .then(answer => {
      // based on their answers, restart if quatity is 0, exit if quantity is =1, or call buyProd 
      if (answer.prodQty === '0') {
        main();
        } else if (answer.prodQty === '-1') {
          console.log("Ok, come back again soon!");
          closeApp();
        } else {
            buyProd(answer.prodId,answer.prodQty); 
      }
    });
}

//Welcome splash
console.log('\n***********************************************');
console.log('*                                             *');
console.log('*            Welcome to BAMAZON !!!           *');
console.log('*                                             *');
console.log('***********************************************');


//Program starts here
main();
