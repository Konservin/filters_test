/*
 * Welcome to your app's main JavaScript file!
 */

import 'bootstrap';
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import $ from 'jquery';
import 'jquery/dist/jquery.min.js';

$(document).ready(function() {
    console.log("jQuery is working!");
});

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

    // Clear existing options
    subtypeSelect.innerHTML = '<option value="">Select a subtype</option>';

    if (typeId) {
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

    // Fetch value type dynamically and adjust the value field
    fetch(`/api/valuetype/${typeId}`)
        .then(response => response.json())
        .then(data => {
            console.log('Value Type:', data.valueType);
            if (data.valueType === 'int') {
                valueField.type = 'number';
            } else if (data.valueType === 'string') {
                valueField.type = 'text';
            } else if (data.valueType === 'date') {
                valueField.type = 'date';
            }
        })
        .catch(error => console.error('Error fetching value type:', error));
}

// Function to add a new criteria
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

    // Attach event listener to the new type select
    let newTypeSelect = newRow.querySelector('.js-type-select');
    if (newTypeSelect) {
        newTypeSelect.addEventListener('change', onTypeChange);
    }
}

function attachAddCriteriaButton() {
    let addCriteriaButton = document.getElementById('add-criteria');
    if (addCriteriaButton) {
        addCriteriaButton.removeEventListener("click", addCriteria); // Remove previous listeners
        addCriteriaButton.addEventListener("click", addCriteria);
    }
}

// Attach event listeners on DOMContentLoaded
document.addEventListener("DOMContentLoaded", function() {
    const filterModal = document.getElementById("filterModal");
    const filterFormContainer = document.getElementById("filterFormContainer");

    $('.js-datepicker').datepicker({
        format: 'dd.mm.yyyy', // Change format
        autoclose: true,
        todayHighlight: true
    });

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
                })
                .catch(error => console.error("Error loading filter form:", error));
        });
    }

    function submitFilterForm(form) {
        let formData = new FormData(form);

        // Debugging: Log all form data before sending
        console.log("Form Submission Data:");
        for (let pair of formData.entries()) {
            console.log(pair[0] + ": " + pair[1]);
        }

        fetch(form.action, {
            method: form.method,
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest' // Ensures Symfony treats it as an AJAX request
            }
        })
            .then(response => response.text())
            .then(html => {
                console.log("Server Response:", html); // Debug response

                if (html.includes("<form")) {
                    document.getElementById("filterFormContainer").innerHTML = html;
                    attachAddCriteriaButton(); // Reattach Add Criteria after reload
                } else {
                    console.log("Form submission successful, reloading page...");
                    location.reload(); // Reload page if successful
                }
            })
            .catch(error => console.error("Error submitting filter form:", error));
    }



    // Attach change event to existing type selects
    document.querySelectorAll('.js-type-select').forEach(select => {
        select.addEventListener('change', onTypeChange);
    });

    // Ensure the button event fires only once
    let addCriteriaButton = document.getElementById('add-criteria');

    if (addCriteriaButton) {
        addCriteriaButton.replaceWith(addCriteriaButton.cloneNode(true)); // Removes all existing listeners
        addCriteriaButton = document.getElementById('add-criteria'); // Re-fetch button
        addCriteriaButton.addEventListener('click', addCriteria);
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
});
