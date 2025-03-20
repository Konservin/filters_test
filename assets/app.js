/*
 * Welcome to your app's main JavaScript file!
 */

import 'bootstrap';
import { Modal } from 'bootstrap';
import $ from 'jquery';
import 'jquery/dist/jquery.min.js';
import 'bootstrap-datepicker/dist/js/bootstrap-datepicker.js';

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import 'bootstrap-datepicker/dist/css/bootstrap-datepicker.css';
import "./app.css"

/*const valueTypes = {
    int: '1',
    string: '2',
    date: '3'
};*/

const valueTypes = {};
fetch(`/api/filtervalues`)
    .then(response => response.json())
    .then(data => {
        data.forEach(subtype => {
            valueTypes[subtype.type] = subtype.id
        });
    })
    .catch(error => console.error('Error fetching value types:', error));
window.valueTypes = valueTypes;

// Function to handle type change event
function onTypeChange(event) {
    const typeSelect = event.target;
    const criteriaItem = typeSelect.closest('.criteria-item');
    const subtypeSelect = criteriaItem.querySelector('.js-subtype-select');
    const valueField = criteriaItem.querySelector('.js-value-input');

    const typeId = typeSelect.value;

    if (!subtypeSelect) {
        console.error("Subtype select not found!");
        return;
    }
    subtypeSelect.innerHTML = '<option value="">Select a subtype</option>';

    changeType(typeId, subtypeSelect);

    // Fetch value type dynamically and adjust the value field
    fetch(`/api/valuetype/${typeId}`)
        .then(response => response.json())
        .then(data => {
            changeValueField(valueField, window.valueTypes[data.valueType]);
        })
        .catch(error => console.error('Error fetching value type:', error));
}

function changeType(typeId, subtypeSelect) {
    if (typeId) {
        subtypeSelect.innerHTML = '';
        fetch(`/api/subtypes/${typeId}`)
            .then(response => response.json())
            .then(data => {
                data.forEach(subtype => {
                    const option = document.createElement('option');
                    option.value = subtype.id;
                    option.textContent = subtype.name;
                    subtypeSelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error fetching subtypes:', error));
    }
}

function addCriteria(event) {
    event.preventDefault();

    let collectionHolder = document.getElementById('criteria-collection');
    let prototype = collectionHolder.dataset.prototype;

    if (!prototype) {
        console.error("Prototype is missing. Ensure Symfony is generating the prototype in the form.");
        return;
    }

    let index = collectionHolder.querySelectorAll('.criteria-item').length;
    let newForm = prototype.replace(/__name__/g, index);

    let tempDiv = document.createElement('div');
    tempDiv.innerHTML = newForm;

    let newRow = document.createElement('tr');
    newRow.classList.add('criteria-item');

    let formElements = tempDiv.querySelectorAll('div.mb-3');

    if (formElements.length < 3) {
        console.error("Expected at least 3 form fields in the prototype but got:", formElements.length);
        return;
    }

    newRow.innerHTML = `
            <td>${formElements[0].innerHTML}</td>
            <td>${formElements[1].innerHTML}</td>
            <td>${formElements[2].innerHTML}</td>
            <td><button type="button" class="btn btn-danger btn-sm remove-criteria" title="Remove"><i class="bi bi-trash"></i></button></td>
        `;

    collectionHolder.appendChild(newRow);

    let newTypeSelect = newRow.querySelector('.js-type-select');
    if (newTypeSelect) {
        newTypeSelect.value = "1"; // Preselect "Amount"
        newTypeSelect.addEventListener('change', onTypeChange);

        setTimeout(() => {
            let event = new Event('change', { bubbles: true });
            newTypeSelect.dispatchEvent(event);
        }, 100);
    }
}

function attachAddCriteriaButton() {
    let addCriteriaButton = document.getElementById('add-criteria');
    if (addCriteriaButton) {
        addCriteriaButton.removeEventListener("click", addCriteria); // Remove previous listeners
        addCriteriaButton.addEventListener("click", addCriteria);
    }
}

function changeInputType() {
    let form = document.querySelector("form");
    if (form) {
        let typeFields = document.querySelectorAll('[id^="filters_criteria_"][id$="_type"]');
        typeFields.forEach(field => {
            let valueField = field.closest('.criteria-item').querySelector('[id^="filters_criteria_"][id$="_value"]');
            changeValueField(valueField, parseInt(field.value));
        });
    }
}

function changeValueField(field, value) {
    field.setAttribute('placeholder', '');
    field.classList.remove('js-datepicker');
    if ($(field).data('datepicker')) {
        $(field).datepicker('destroy');
    }

    if (value === window.valueTypes['int']) {
        field.type = 'number';
    } else if (value === window.valueTypes['string']) {
        field.type = 'text';
    } else if (value === window.valueTypes['date']) {
        // Use a text field instead of a date input to use Bootstrap Datepicker with dd.mm.yyyy format
        field.type = 'text';
        field.classList.add('js-datepicker');
        field.setAttribute('placeholder', 'dd.mm.yyyy')

        $(field).datepicker({
            format: 'dd.mm.yyyy',
            autoclose: true,
            todayHighlight: true
        });
    }
}
document.addEventListener("DOMContentLoaded", function() {
    const sidebarNav = document.getElementById("sidebar-nav");
    const listContent = document.getElementById("list-content");

    let isFetching = false; // Prevent multiple requests

    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            if (isFetching) return; // Stop if already fetching

            let listName = this.getAttribute("data-list");
            isFetching = true;

            fetch(`/api/list/${listName}`)
                .then(response => response.text())
                .then(html => {
                    listContent.innerHTML = html;
                    isFetching = false;

                    // Remove "active" class from all sidebar links
                    sidebarNav.querySelectorAll(".nav-link").forEach(nav => nav.classList.remove("active", "fw-bold", "text-primary"));

                    // Add "active" class, bold font, and blue color to selected link
                    this.classList.add("active", "fw-bold", "text-primary");
                })
                .catch(error => {
                    console.error("Error loading list:", error);
                    isFetching = false;
                });
        });
    });

    attachAddCriteriaButton();
    changeInputType();
    const editFilterModal = document.getElementById("editFilterModal");
    if (editFilterModal) {
        editFilterModal.addEventListener("shown.bs.modal", function () {
            changeInputType();
            document.querySelectorAll('.js-type-select').forEach(select => {
                const subtypeSelect = select.parentElement.parentElement.querySelector('.js-subtype-select')
                changeType(select.value, subtypeSelect);
            });
        });
    }

    const filterModal = document.getElementById("filterModal");
    const filterFormContainer = document.getElementById("filterFormContainer");
    const saveFilterBtn = document.getElementById("save-filter-btn");

    if (filterModal) {
        filterModal.addEventListener("show.bs.modal", function () {
            fetch("/filter/new/modal", {
                headers: { "X-Requested-With": "XMLHttpRequest" }
            })
                .then(response => response.text())
                .then(html => {
                    filterFormContainer.innerHTML = html;

                    // Attach event listener for form submission
                    let form = filterFormContainer.querySelector("form");
                    if (form) {
                        form.addEventListener("submit", function (event) {
                            event.preventDefault();
                            submitFilterForm(form);
                        });
                    }

                    // Reattach "Add Criteria" event listener after form loads
                    attachAddCriteriaButton();
                    saveFilterBtn.addEventListener("click", function () {
                        if (form && form.checkValidity()) {
                            form.submit();
                        } else {
                            form.reportValidity(); // Shows validation error messages
                        }
                    });
                })
                .catch(error => console.error("Error loading filter form:", error));
        });
    }

    function submitFilterForm(form) {
        let formData = new FormData(form);
        fetch(form.action, {
            method: form.method,
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest' // Ensures Symfony treats it as an AJAX request
            }
        })
            .then(response => response.text())
            .then(html => {
                if (html.includes("<form")) {
                    document.getElementById("filterFormContainer").innerHTML = html;
                    attachAddCriteriaButton(); // Reattach Add Criteria after reload
                }
                if (html.includes("alert-danger") || html.includes("form-error")) {
                    document.getElementById("editFilterFormContainer").innerHTML = html;
                } else {
                    location.reload(); // Reload page if successful
                }
            })
            .catch(error => console.error("Error submitting filter form:", error));
    }
    const editFilterFormContainer = document.getElementById("editFilterFormContainer");
    const saveEditFilterBtn = document.getElementById("saveEditFilterBtn");

    // Load form when "Edit" button is clicked
    document.querySelectorAll(".edit-filter").forEach(button => {
        button.addEventListener("click", function () {
            let filterId = this.getAttribute("data-filter-id");

            fetch(`/filter/edit/modal/${filterId}`, {
                headers: { "X-Requested-With": "XMLHttpRequest" }
            })
                .then(response => response.text())
                .then(html => {
                    editFilterFormContainer.innerHTML = html;

                    let form = editFilterFormContainer.querySelector("form");
                    if (form) {
                        form.setAttribute('action', 'filter/edit/' + filterId);
                        let nonModalButton = document.querySelector('.non-modal-button');
                        nonModalButton.setAttribute('href', '/filter/edit/' + filterId)
                        saveEditFilterBtn.addEventListener("click", function () {
                            if (form && form.checkValidity()) {
                                submitFilterForm(form);
                            } else {
                                form.reportValidity(); // Shows validation error messages
                            }
                        });
                    }
                })
                .catch(error => console.error("Error loading edit filter form:", error));
        });
    });

    // Attach change event to existing type selects
    document.querySelectorAll('.js-type-select').forEach(select => {
        changeType(typeId);
    });

    // Ensure the button event fires only once
    let addModalCriteriaButton = document.getElementById('modal-add-criteria');

    if (addModalCriteriaButton) {
        addModalCriteriaButton.replaceWith(addModalCriteriaButton.cloneNode(true)); // Removes all existing listeners
        addModalCriteriaButton = document.getElementById('modal-add-criteria'); // Re-fetch button
        addModalCriteriaButton.addEventListener('click', addCriteria);
    }

    document.addEventListener("click", function (event) {
        if (event.target.parentElement.classList.contains("remove-criteria")) {
            event.preventDefault();
            let row = event.target.parentElement.closest("tr"); // Find the closest row
            if (row) {
                row.remove(); // Remove the row from the table
            }
        }
    });

    let rowToDelete = null;
    let filterIdToDelete = null;

    // Attach click event to dynamically added "Remove" buttons
    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("remove-filter")) {
            event.preventDefault();
            rowToDelete = event.target.closest(".criteria-item"); // Get the row
            filterIdToDelete = event.target.dataset.bsTarget; // Get criteria ID from data attribute
            let confirmModal = new Modal(document.getElementById("confirmDeleteModal"));
            confirmModal.show();
        }
    });

    // Confirm deletion
    let confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
    if (confirmDeleteBtn) {
        document.getElementById("confirmDeleteBtn").addEventListener("click", function () {
            if (filterIdToDelete) {
                fetch(`/filter/delete/${filterIdToDelete}`, {
                    method: "DELETE",
                    headers: {
                        "X-Requested-With": "XMLHttpRequest"
                    }
                })
                    .then(response => {
                        if (response.ok) {
                            rowToDelete.remove(); // Remove the row from the frontend
                        } else {
                            console.error("Failed to delete filter");
                        }
                    })
                    .catch(error => console.error("Error deleting filter:", error))
                    .finally(() => {
                        let confirmModal = Modal.getInstance(document.getElementById("confirmDeleteModal"));
                        confirmModal.hide();
                        rowToDelete = null;
                        filterIdToDelete = null;
                    });
            }
        });
    }
});
