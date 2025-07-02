// Function to handle the download process (reused)
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

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const selectFileButton = document.getElementById('selectFileButton');
    const addedTextarea = document.getElementById('addedText');
    const previewTextarea = document.getElementById('previewText'); // New: Preview textarea
    const downloadModifiedButton = document.getElementById('downloadModifiedButton'); // New: Download button
    const statusMessage = document.getElementById('statusMessage');

    let currentFileName = ''; // To store the original file name for download

    // 1. Event listener for the "Select File & Generate Preview" button
    selectFileButton.addEventListener('click', () => {
        fileInput.click(); // Programmatically click the hidden file input
    });

    // 2. Event listener for when a file is selected in the file input
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        currentFileName = file ? file.name : ''; // Store the file name

        if (!file) {
            statusMessage.textContent = "No file selected. Please choose a .txt file.";
            previewTextarea.value = ''; // Clear preview
            downloadModifiedButton.disabled = true; // Disable download button
            return;
        }

        if (!file.name.toLowerCase().endsWith('.txt')) {
            statusMessage.textContent = "Error: Please select a .txt file.";
            previewTextarea.value = ''; // Clear preview
            downloadModifiedButton.disabled = true; // Disable download button
            event.target.value = ''; // Clear input for re-selection
            return;
        }

        statusMessage.textContent = `Reading "${file.name}"...`;

        const reader = new FileReader();

        reader.onload = function(e) {
            const originalContent = e.target.result;
            const customTextToAdd = addedTextarea.value; // Get text from first textarea

            // --- Modification Logic ---
            const modifiedContent = customTextToAdd + "\n\n" + originalContent;

            // Display the modified content in the preview textarea
            previewTextarea.value = modifiedContent;
            statusMessage.textContent = `Preview generated for "${file.name}". Review and download.`;

            // Enable the download button now that content is ready for review
            downloadModifiedButton.disabled = false;

            event.target.value = ''; // Clear input to allow re-selection of the same file
        };

        reader.onerror = function(e) {
            console.error("Error reading file:", e.target.error);
            statusMessage.textContent = "Error reading the file. Please try again.";
            previewTextarea.value = '';
            downloadModifiedButton.disabled = true;
            event.target.value = '';
        };

        reader.readAsText(file); // Read the file as text
    });

    // 3. New event listener for the "Download Reviewed File" button
    downloadModifiedButton.addEventListener('click', () => {
        const contentToDownload = previewTextarea.value; // Get content from the preview textarea

        if (!contentToDownload) {
            alert("No content to download. Please select a file and generate a preview first.");
            return;
        }

        // Suggest a new name based on the original file name
        const suggestedFileName = currentFileName ? currentFileName.replace(/(\.txt)$/i, '_reviewed.txt') : 'modified_file.txt';

        downloadModifiedFile(contentToDownload, suggestedFileName);
        statusMessage.textContent = `"${suggestedFileName}" downloaded!`;
        
        // Optionally clear preview and disable button after download
        previewTextarea.value = '';
        downloadModifiedButton.disabled = true;
    });
});
