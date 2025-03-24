chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed. Storage should be available.");
});

// chrome.commands.onCommand.addListener((command) => {
//     if (command === "open-instance") {
//         chrome.storage.sync.get(["instances"], (data) => {
//             if (data.instances && data.instances.length > 0) {
//                 chrome.tabs.create({ url: data.instances[0].url });
//             }
//         });
//     }
// });

chrome.commands.onCommand.addListener((command) => {
    chrome.storage.sync.get(["instances"], (data) => {
        const instances = data.instances || [];

        // Categorize instances by type
        const categorized = { Dev: [], Test: [], Prod: [] };
        instances.forEach(inst => {
            if (categorized[inst.type]) {
                categorized[inst.type].push(inst);
            }
        });

        // Map commands to their respective instance types
        const shortcutMapping = {
            "open-dev-1": categorized.Dev[0],  // Alt+1 → First Dev instance
            "open_test_instance": categorized.Test[0], // Alt+2 → First Test instance
            "open_prod_instance": categorized.Prod[0] // Alt+3 → First Prod instance
        };

        // Open the corresponding instance if available
        if (shortcutMapping[command] && shortcutMapping[command].url) {
            chrome.tabs.create({ url: shortcutMapping[command].url });
        }
    });
});
