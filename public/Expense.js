let expenseInput = document.getElementById("expenseAmount");
let descriptionInput = document.getElementById("description");
let categoryInput = document.getElementById("category");
let addExpenseButton = document.getElementById("addExpense");
let expenseList = document.getElementById("expenseList");

let expenses = [];

// Retrieve the userId and premium user status from local storage
if (localStorage.userDetails) {
  JSON.parse(localStorage.getItem("userDetails"));
}

if (localStorage.expenses) {
  expenses = JSON.parse(localStorage.expenses);
}

// Function to fetch expenses from the database and update localStorage
const fetchExpensesAndUpdateLocalStorage = async () => {
  try {
    const token = JSON.parse(localStorage.getItem("userDetails"));

    const response = await axios.get(`http://localhost:8000/expense/get`, {
      headers: {
        Authorization: `Bearer ${token} `,
      },
    });

    console.log(response);
    console.log(response.data);
    const fetchedExpenses = response.data.data;
    // console.log(fetchedExpenses);

    // Update expenses array with fetched expenses
    expenses = fetchedExpenses;

    // Update localStorage with updated expenses array
    localStorage.expenses = JSON.stringify(expenses);

    console.log("Your Expenses :", expenses);
  } catch (error) {
    console.log(error);
  }
};
// Call the function to fetch expenses and update localStorage
fetchExpensesAndUpdateLocalStorage();

//create a new expense
addExpenseButton.addEventListener("click", async function () {
  let expenseAmount = expenseInput.value;
  let description = descriptionInput.value;
  let category = categoryInput.value;

  let expense = {
    amount: expenseAmount,
    description,
    category,
  };

  try {
    const token = JSON.parse(localStorage.getItem("userDetails"));

    const response = await axios.post(
      `http://localhost:8000/expense/create`,
      expense,
      {
        headers: {
          Authorization: `Bearer ${token} `,
        },
      }
    );

    console.log(response.data);

    alert("Added expenses successfully to the database");
  } catch (error) {
    console.log(error);
    alert("Request failed with status code 400");
  }
  expenses.push(expense);
  localStorage.expenses = JSON.stringify(expenses);
  expenseInput.value = "";
  descriptionInput.value = "";
  displayExpenses();
});

//After creating we display expenses, we need to create a new unordered list of Expenses, create delete and edit button with their functionality
function displayExpenses() {
  expenseList.innerHTML = "";

  for (let i = 0; i < expenses.length; i++) {
    let expense = expenses[i];
    // console.log(expense._id);
    let expenseId = expense._id;
    let listItem = document.createElement("li");
    listItem.innerHTML = `EXPENSE AMOUNT: ${expense.amount}, DESCRIPTION: ${expense.description}, CATEGORY: ${expense.category}`;

    let deleteButton = document.createElement("button");
    deleteButton.innerHTML = " Delete";
    deleteButton.className = "Danger";
    deleteButton.addEventListener("click", async function () {
      try {
        const token = JSON.parse(localStorage.getItem("userDetails"));

        const deleteResponse = await axios.delete(
          `http://localhost:8000/expense/delete/${expenseId}`,
          {
            headers: {
              Authorization: `Bearer ${token} `,
            },
          }
        );

        console.log(deleteResponse);
        alert("Delete response from the database successfully");
        // Remove the expense from the expenses array
        expenses.splice(i, 1);

        // Update the local storage
        localStorage.setItem("expenses", JSON.stringify(expenses));

        // Update the displayed expenses
        displayExpenses();
      } catch (error) {
        console.log(error);
      }
    });

    let editButton = document.createElement("button");
    editButton.textContent = " Edit";
    editButton.className = "primary";
    editButton.addEventListener("click", function () {
      // Set the expense details as the current values of the input fields
      expenseInput.value = expense.amount;
      descriptionInput.value = expense.description;
      categoryInput.value = expense.category;

      // Create a save button
      const saveButton = document.createElement("button");
      saveButton.textContent = "Save";
      saveButton.className = "primary";

      // Add an event listener to the save button
      saveButton.addEventListener("click", async function () {
        // Get the updated expense details from the input fields
        const updatedAmount = expenseInput.value;
        const updatedDescription = descriptionInput.value;
        const updatedCategory = categoryInput.value;

        // Update the expense object with the updated details
        expense.amount = updatedAmount;
        expense.description = updatedDescription;
        expense.category = updatedCategory;

        try {
          const token = JSON.parse(localStorage.getItem("userDetails"));
          // console.log(expense._id);
          const response = await axios.put(
            `http://localhost:8000/expense/update/${expenseId}`,
            expense,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          console.log(response);
          alert("Expense updated successfully in the database");
        } catch (error) {
          console.log(error);
          alert("Request failed with status code 400");
        }

        // Update the local storage
        localStorage.setItem("expenses", JSON.stringify(expenses));

        // Update the displayed expenses
        displayExpenses();

        // Remove the save button and restore the delete and edit buttons
        listItem.removeChild(saveButton);
        listItem.appendChild(deleteButton);
        listItem.appendChild(editButton);
      });

      // Replace the edit button with the save button
      listItem.replaceChild(saveButton, editButton);
    });

    listItem.appendChild(deleteButton);
    listItem.appendChild(editButton);
    expenseList.appendChild(listItem);
  }
}
displayExpenses();

//how to parse the jwt in the frontend, copied this from the google
function parseJwt(token) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );
  return JSON.parse(jsonPayload);
}

//download functionality for the aws s3 service
async function download() {
  try {
    const token = JSON.parse(localStorage.getItem("userDetails"));

    const response = await axios.get(`http://localhost:8000/expense/download`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200) {
      // The backend is essentially sending a download link
      // which if we open in browser, the file would download
      var a = document.createElement("a");
      a.href = response.data.fileUrl;
      a.download = "myexpense.csv";
      a.click();
    }
  } catch (error) {
    console.log(error);
  }
}

// After a successful purchase, the user will be shown as a premium user
function showIsPremiumUser() {
  // Remove the "Buy Premium" button
  const buyPremiumButton = document.getElementById("razorpay");
  buyPremiumButton.remove();
  // Update the UI to show the premium user message
  document.getElementById("message").textContent =
    "YOU ARE A PREMIUM USER NOW !!!";
  const leaderboardButton = document.createElement("button");
  leaderboardButton.textContent = "Show Leaderboard";
  leaderboardButton.className = "leaderboard";
  document.body.appendChild(leaderboardButton);

  leaderboardButton.addEventListener("click", () => {
    const screenWidth = window.innerWidth;
    let page, size;

    if (screenWidth >= 1024) {
      // For big screens, restrict to certain pages
      page = 0; // we can  change this to the desired page number
      size = 10; //we can Change this to the desired number of expenses per page
    } else {
      // For small screens, restrict to certain page
      page = 0;
      size = 5;
    }
    userLeaderboard(page, size);
    leaderboardButton.remove();
  });

  const userLeaderboard = async (page, size) => {
    try {
      const token = JSON.parse(localStorage.getItem("userDetails"));

      const getLeaderBoard = await axios.get(
        `http://localhost:8000/expense/showleaderboard?page=${page}&size=${size}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const leaderboardElement = document.getElementById("leaderboard");
      leaderboardElement.innerHTML = "<h3><b>LEADERBOARD</b></h3>";
      leaderboardElement.className = "header";

      getLeaderBoard.data.leaderboard.forEach((userDetails) => {
        console.log(userDetails);
        const userElement = document.createElement("div");
        userElement.textContent = `Id: ${userDetails.id} Name: ${userDetails.name} Total_Expenses: ${userDetails.totalExpenses}`;
        leaderboardElement.appendChild(userElement);
        userElement.className = "text";
      });

      // Add pagination buttons
      const paginationContainer = document.getElementById("page");
      paginationContainer.innerHTML = "";

      // Previous button
      if (page > 0) {
        const previousButton = document.createElement("button");
        previousButton.textContent = "Previous";
        previousButton.className = "button";
        previousButton.addEventListener("click", () => {
          userLeaderboard(page - 1, size);
        });
        paginationContainer.appendChild(previousButton);
      }

      // Next button
      const nextButton = document.createElement("button");
      nextButton.textContent = "Next";
      nextButton.className = "button";
      nextButton.addEventListener("click", () => {
        userLeaderboard(page + 1, size);
      });
      paginationContainer.appendChild(nextButton);
    } catch (error) {
      console.log(error);
    }
  };
}

const user = JSON.parse(localStorage.getItem("userDetails"));
const decodedUser = parseJwt(user);
const userDetails = decodedUser.id;
console.log(userDetails);

function checkIsPremimumUser() {
  const orderToken = JSON.parse(localStorage.getItem("premiumUser"));
  if (orderToken) {
    const decodedToken = parseJwt(orderToken);
    console.log(decodedToken);
    console.log("The User Premium is: ", decodedToken.id.isPremiumUser);
    console.log(decodedToken.id.id);
    if (decodedToken.id.isPremiumUser) {
      showIsPremiumUser();
    }
  }
}

// for razor pay,
document
  .getElementById("razorpay")
  .addEventListener("click", async function (e) {
    e.preventDefault();

    try {
      const token = JSON.parse(localStorage.getItem("userDetails"));

      const response = await axios.get(
        `http://localhost:8000/order/purchasePremium`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);

      const options = {
        key: response.data.key_id,
        orderId: response.data.orderId,
        handler: async function () {
          const res = await axios.post(
            `http://localhost:8000/order/updateTransactionStatus`,
            {
              orderId: options.orderId,
              paymentId: response.razorpay_paymentId,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          console.log(res.data);

          alert("You are a Premium user now");

          localStorage.setItem("premiumUser", JSON.stringify(res.data.token));
          checkIsPremimumUser();
        },
      };
      const rzp = new Razorpay(options);
      rzp.open();
    } catch (error) {
      console.log(error);
    }
  });

checkIsPremimumUser();

// Add event listener to the logout button
document.getElementById("logout").addEventListener("click", logout);
// Function to logout and redirect to the login page
function logout(e) {
  e.preventDefault();

  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("userDetails");
    localStorage.removeItem("expenses");

    window.location.href = "./Login.html";
  }
}
