// Function to handle the download process
function downloadModifiedFile(content, filename) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Get references to HTML elements once the DOM is loaded
// We use DOMContentLoaded or defer in the script tag to ensure elements exist
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const selectFileButton = document.getElementById('selectFileButton');
    const statusMessage = document.getElementById('statusMessage');
    const addedTextarea = document.getElementById('addedText');

    // Attach event listener to the button
    selectFileButton.addEventListener('click', () => {
        fileInput.click(); // Programmatically click the hidden file input
    });

    // Attach event listener to the file input (when a file is selected)
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0]; // Get the selected file
        const customTextToAdd = addedTextarea.value; // Get the user's custom text

        if (!file) {
            statusMessage.textContent = "No file selected. Please choose a .txt file.";
            return;
        }

        if (!file.name.toLowerCase().endsWith('.txt')) {
            statusMessage.textContent = "Error: Please select a .txt file.";
            // Clear the input so the same file can be selected again if needed
            event.target.value = '';
            return;
        }

        statusMessage.textContent = `Reading "${file.name}"...`;

        const reader = new FileReader();

        reader.onload = function(e) {
            const originalContent = e.target.result; // The content of the original file

            // --- Modification Logic: Combine custom text with original content ---
            const modifiedContent = customTextToAdd + "\n\n" + originalContent; // Add two newlines for separation

            // --- Offer the modified content for download ---
            const newFileName = file.name.replace(/(\.txt)$/i, '_modified$1'); // e.g., mydoc.txt -> mydoc_modified.txt
            downloadModifiedFile(modifiedContent, newFileName);
            statusMessage.textContent = `"${newFileName}" is ready for download!`;

            // Clear the input value so selecting the same file again triggers change event
            event.target.value = ''; // Resets the file input
        };

        reader.onerror = function(e) {
            console.error("Error reading file:", e.target.error);
            statusMessage.textContent = "Error reading the file. Please try again.";
            event.target.value = '';
        };

        reader.readAsText(file); // Read the file as text
    });
});
