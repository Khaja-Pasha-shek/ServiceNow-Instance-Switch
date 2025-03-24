if (chrome?.storage?.sync) {
    chrome.storage.sync.get(["instances"], function (data) {
        console.log("Instances:", data.instances);
    });
} else {
    console.error("chrome.storage.sync is not available. Check permissions and context.");
}

document.addEventListener("DOMContentLoaded", function () {
    // Get DOM elements
    const instanceNameInput = document.getElementById("instanceName");
    const instanceUrlInput = document.getElementById("instanceUrl");
    const instanceTypeSelect = document.getElementById("instanceType");
    const addInstanceButton = document.getElementById("addInstance");
    const goButton = document.getElementById("goButton");
    const typeDropdown = document.getElementById("typeDropdown");
    const instanceDropdown = document.getElementById("instanceDropdown");
    const editButton = document.getElementById("editInstance");

    editButton.disabled = true; // Disable edit button initially

    // Enable the edit button when an instance is selected
    instanceDropdown.addEventListener("change", function () {
        editButton.disabled = !instanceDropdown.value;
    });

    // Load instances from storage
    function loadInstances() {
        chrome.storage.sync.get(["instances"], function (data) {
            const instances = data.instances || [];
            const types = {};

            // Categorize instances by type
            instances.forEach((inst, index) => {
                if (!types[inst.type]) {
                    types[inst.type] = [];
                }
                types[inst.type].push({ ...inst, index });
            });

            // Populate type dropdown
            typeDropdown.innerHTML = '<option value="">Select Type</option>';
            Object.keys(types).forEach(type => {
                const option = document.createElement("option");
                option.value = type;
                option.textContent = type;
                typeDropdown.appendChild(option);
            });

            updateInstanceDropdown();
        });
    }

    // Add instance
    addInstanceButton.addEventListener("click", function () {
        const name = instanceNameInput.value.trim();
        const url = instanceUrlInput.value.trim();
        const type = instanceTypeSelect.value;

        if (!name || !url) {
            alert("Please enter both name and URL.");
            return;
        }

        chrome.storage.sync.get(["instances"], function (data) {
            const instances = data.instances || [];
            instances.push({ name, url, type });

            chrome.storage.sync.set({ instances }, function () {
                instanceNameInput.value = "";
                instanceUrlInput.value = "";
                loadInstances();
            });
        });
    });

    // Handle "Go" button click
    goButton.addEventListener("click", function () {
        const selectedIndex = instanceDropdown.value;
        if (selectedIndex === "") {
            alert("Please select an instance.");
            return;
        }

        chrome.storage.sync.get(["instances"], function (data) {
            const instances = data.instances || [];
            const selectedInstance = instances[parseInt(selectedIndex)];
            if (selectedInstance) {
                chrome.tabs.create({ url: selectedInstance.url });
            }
        });
    });

    // Edit Button Logic
    editButton.addEventListener("click", function () {
        const selectedIndex = instanceDropdown.value;
        if (selectedIndex === "") return;

        chrome.storage.sync.get(["instances"], function (data) {
            let instances = data.instances || [];
            const selectedInstance = instances[parseInt(selectedIndex)];

            if (!selectedInstance) return;

            const newUrl = prompt("Enter the new URL:", selectedInstance.url);
            if (!newUrl) return; // Do nothing if canceled

            // Update the selected instance's URL
            instances[parseInt(selectedIndex)].url = newUrl;

            chrome.storage.sync.set({ instances }, function () {
                console.log("Updated instance:", newUrl);
                loadInstances(); // Refresh UI
            });
        });
    });

    // Update instance dropdown based on selected type
    function updateInstanceDropdown() {
        chrome.storage.sync.get(["instances"], function (data) {
            const instances = data.instances || [];
            const selectedType = typeDropdown.value;
            instanceDropdown.innerHTML = '<option value="">Select Instance</option>';

            instances.forEach((inst, index) => {
                if (inst.type === selectedType) {
                    const option = document.createElement("option");
                    option.value = index;  // Store index as value
                    option.textContent = inst.url;
                    instanceDropdown.appendChild(option);
                }
            });

            editButton.disabled = true; // Reset edit button state
        });
    }

    // Load instances when popup is opened
    typeDropdown.addEventListener("change", updateInstanceDropdown);
    loadInstances();
});