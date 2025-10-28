let newTask = document.querySelector(".add");
let addTaskModal = document.querySelector(".modal");
let editTaskModal = document.querySelector(".edit-modal");
let cancelEditTaskModal = document.querySelector(".edit-modal .cancel");
let cancelAddTaskModal = document.querySelector(".modal .cancel");
let saveCard = document.querySelector(".modal .save");
let saveCardEdit = document.querySelector(".edit-modal .save");
let cardTitle = document.querySelector(".modal #title");
let cardTitleEdited = document.querySelector(".edit-modal #title");
let cardDescp = document.querySelector(".modal #description");
let cardDescpEdited = document.querySelector(".edit-modal #description");
let cardStatus = document.querySelector(".modal #status");
let cardStatusEdited = document.querySelector(".edit-modal #status");
let editId = document.getElementById("edit-id");

// Id generator for card.
function generateId() {
  return Date.now() + Math.random().toString(36).substr(2, 9);
}

// Date and Time when card was created at.
function dateAndTime() {
  let date = new Date();
  date = date.toString();
  date = date.split(" ");

  currentDate = date[2] + " " + date[1] + ", " + date[3];

  let time = date[4];

  let createdAt = currentDate + " " + time;
  return createdAt;
}

let todoContainer = document.querySelector(".todo");
let inProgressContainer = document.querySelector(".in-progress");
let doneContainer = document.querySelector(".done");
let containers = document.querySelectorAll(".todo, .in-progress, .done");

// keeps track of cards the containers have
function updateTaskCounters() {
  const counts = { todo: 0, inProgress: 0, done: 0 };

  for (const task of tasks) {
    if (counts.hasOwnProperty(task.status)) {
      counts[task.status]++;
    }
  }

  todoContainer.querySelector(".info h5").textContent = counts.todo;
  inProgressContainer.querySelector(".info h5").textContent = counts.inProgress;
  doneContainer.querySelector(".info h5").textContent = counts.done;
}

// Card class
class card {
  constructor(
    title,
    descp,
    status,
    id = generateId(),
    createdAt = dateAndTime()
  ) {
    this.id = id; // Card id to identify each card
    this.title = title;
    this.descp = descp;
    this.status = status;
    this.createdAt = createdAt;
  }

  create() {
    const card = document.createElement("div");
    card.classList.add("card");
    card.draggable = "true";
    card.dataset.id = this.id;

    // Every newly appended card will have drag start eventlistener.
    card.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", e.target.dataset.id);
    });

    const h5 = document.createElement("h5");
    h5.textContent = this.title;
    card.appendChild(h5);

    const p = document.createElement("p");
    p.textContent = this.descp;
    card.appendChild(p);

    const subInfo = document.createElement("div");
    subInfo.classList.add("sub-info");
    card.appendChild(subInfo);

    const createdAt = document.createElement("div");
    createdAt.classList.add("created-at");
    subInfo.appendChild(createdAt);

    const createdAtP = document.createElement("p");
    createdAtP.textContent = this.createdAt;
    createdAt.appendChild(createdAtP);

    const options = document.createElement("div");
    options.classList.add("options");
    subInfo.appendChild(options);

    const edit = document.createElement("div");
    edit.classList.add("edit");
    edit.textContent = "✏️";
    options.appendChild(edit);

    edit.addEventListener("click", () => {
      const index = ["todo", "inProgress", "done"];

      editTaskModal.classList.toggle("hide");
      editId.value = this.id;

      cardTitleEdited.value = this.title;
      cardDescpEdited.value = this.descp;

      cardStatusEdited.selectedIndex = index.indexOf(this.status);
    });

    const del = document.createElement("div");
    del.classList.add("delete");
    del.textContent = "🗑️";
    options.appendChild(del);

    del.addEventListener("click", (e) => {
      // Confirmation before deletion
      const confirmDelete = confirm(
        "Are you sure you want to delete this task?"
      );

      if (confirmDelete) {
        // Remove from DOM
        card.remove();

        // Remove from main array and eventually local storage
        tasks = tasks.filter((task) => task.id !== this.id);
        localstorageUpdate(tasks);
        updateTaskCounters();
        console.log("Tasks after deletion", tasks);
      }
    });

    return card;
  }

  // Creates an Object that represents a card
  getCardDataObject(cardInstance) {
    return {
      id: cardInstance.id,
      title: cardInstance.title,
      descp: cardInstance.descp,
      status: cardInstance.status,
      createdAt: cardInstance.createdAt,
    };
  }

  appendTo(parent) {
    // Append the card to the parent element passed.
    parent.appendChild(this.create());

    // 1. Get the data object from the current instance (this)
    let cardInfo = this.getCardDataObject(this);
    console.log(cardInfo);

    // 2. Push the data object to the array
    tasks.push(cardInfo);
    console.log("Tasks:", tasks);

    // 3. Update storage
    localstorageUpdate(tasks);
  }
}

function cardContainerSort(cardInfo, cardStatusValue) {
  // Sort cards in the containers they belong based on status.
  switch (cardStatusValue) {
    case "todo":
      cardInfo.appendTo(todoContainer);
      break;

    case "inProgress":
      cardInfo.appendTo(inProgressContainer);
      break;

    case "done":
      cardInfo.appendTo(doneContainer);
      break;

    default:
      console.error("Value undefined.");
      break;
  }
}

// Main array to store all the card objects
let tasks = [];

// Setting up localstorage
let localstorageUpdate = (tasks) => {
  localStorage.setItem("Tasks", JSON.stringify(tasks));
  console.log("Local storage: ", JSON.parse(localStorage.getItem("Tasks")));
};

// Parsing localstorage for available data and appending cards accordingly
window.addEventListener("DOMContentLoaded", () => {
  const localStorageData = JSON.parse(localStorage.getItem("Tasks") || "[]");

  if (localStorageData.length > 0) {
    console.log("Tasks loaded from localStorage", localStorageData);

    // Set the in-memory array directly instead of pushing duplicates
    tasks = localStorageData;

    // Just render them visually, don't re-push to localStorage
    localStorageData.forEach((cardObj) => {
      const newCard = new card(
        cardObj.title,
        cardObj.descp,
        cardObj.status,
        cardObj.id,
        cardObj.createdAt
      );

      // Create DOM only
      const element = newCard.create();
      switch (cardObj.status) {
        case "todo":
          todoContainer.appendChild(element);
          break;
        case "inProgress":
          inProgressContainer.appendChild(element);
          break;
        case "done":
          doneContainer.appendChild(element);
          break;
      }
    });

    updateTaskCounters();
  }
});

newTask.addEventListener("click", () => {
  addTaskModal.classList.toggle("hide");
});

cancelAddTaskModal.addEventListener("click", () => {
  addTaskModal.classList.toggle("hide");
});

cancelEditTaskModal.addEventListener("click", () => {
  editTaskModal.classList.toggle("hide");
});

// Appends the card in the container that has same status chosen when creating the card.
saveCard.addEventListener("click", () => {
  let cardTitleValue = cardTitle.value.trim();
  let cardDescpValue = cardDescp.value.trim();
  let cardStatusValue = cardStatus.value;

  // Does not let user create card without title.
  if (!cardTitleValue) {
    alert("Please enter a title for the task.");
    return;
  }

  let cardInfo = new card(cardTitleValue, cardDescpValue, cardStatusValue);

  console.log(cardStatusValue);

  cardContainerSort(cardInfo, cardStatusValue);

  updateTaskCounters();

  cardTitle.value = "";
  cardDescp.value = "";
  cardStatus.selectedIndex = 0;
  addTaskModal.classList.toggle("hide");
});

// Edits the card content.
saveCardEdit.addEventListener("click", () => {
  const card = tasks.find((task) => task.id === editId.value);
  const editedCard = document.querySelector(`[data-id="${editId.value}"]`);

  let cardTitleValue = cardTitleEdited.value.trim();
  let cardDescpValue = cardDescpEdited.value.trim();
  let cardStatusValue = cardStatusEdited.value;

  // Does not let user save card without title.
  if (!cardTitleValue) {
    alert("Please enter a title for the task.");
    return;
  }

  if (cardTitleValue !== card.title) {
    document.querySelector(`[data-id="${editId.value}"] h5`).textContent =
      cardTitleValue;
  }

  if (cardDescpValue !== card.descp) {
    document.querySelector(`[data-id="${editId.value}"] p`).textContent =
      cardDescpValue;
  }

  if (card.status !== cardStatusValue) {
    const parent = document.querySelector(
      `[data-status="${
        card.status == "inProgress" ? "in-progress" : card.status
      }"]`
    );

    // Re-sort cards in the containers if status is edited.
    switch (cardStatusValue) {
      case "todo":
        todoContainer.append(editedCard);
        break;

      case "inProgress":
        inProgressContainer.append(editedCard);
        break;

      case "done":
        doneContainer.append(editedCard);
        break;

      default:
        console.error("Value undefined.");
        break;
    }
  }

  card.title = cardTitleValue;
  card.descp = cardDescpValue;
  card.status = cardStatusValue;

  editId.value = "";
  cardTitleEdited.value = "";
  cardDescpEdited.value = "";
  cardStatusEdited.selectedIndex = 0;

  console.log(card);
  console.log(tasks);
  localstorageUpdate(tasks);
  editTaskModal.classList.toggle("hide");
});

// Handle drag over + drop on containers.
containers.forEach((container) => {
  container.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  container.addEventListener("drop", (e) => {
    const cardId = e.dataTransfer.getData("text/plain");
    const draggedCardElement = document.querySelector(`[data-id="${cardId}"]`);

    if (draggedCardElement) {
      container.appendChild(draggedCardElement);

      const newStatus = container.dataset.status;
      const taskToUpdate = tasks.find((task) => task.id === cardId);

      if (taskToUpdate) {
        taskToUpdate.status = newStatus;
        updateTaskCounters();
        localstorageUpdate(tasks);
        console.log(`Task '${taskToUpdate.title}' moved to ${newStatus}`);
        console.log("Updated tasks array:", tasks);
      }
    }
  });
});

// Clear all button, removes cards from DOM as well as empties our object array.
const clearAllBtn = document.querySelector(".clear");
clearAllBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all tasks?")) {
    tasks = [];
    localstorageUpdate(tasks);
    containers.forEach((c) => {
      const cards = c.querySelectorAll(".card");
      cards.forEach((card) => card.remove());
    });
    updateTaskCounters();
    console.log("All tasks cleared.");
  }
});
