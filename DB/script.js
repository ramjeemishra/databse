const dbName = 'myDatabase';
    const dbVersion = 1;

    // Open or create a database
    const dbRequest = indexedDB.open(dbName, dbVersion);

    // Define the database schema
    dbRequest.onupgradeneeded = function(event) {
        const db = event.target.result;
        const section1Store = db.createObjectStore('section1', { keyPath: 'id', autoIncrement: true });
        const section2Store = db.createObjectStore('section2', { keyPath: 'id', autoIncrement: true });
        const section3Store = db.createObjectStore('section3', { keyPath: 'id', autoIncrement: true });
        // const section4Store = db.createObjectStore('section4', { keyPath: 'id', autoIncrement: true });
        // const section5Store = db.createObjectStore('section5', { keyPath: 'id', autoIncrement: true });
        // const section6Store = db.createObjectStore('section6', { keyPath: 'id', autoIncrement: true });
        // const section7Store = db.createObjectStore('section7', { keyPath: 'id', autoIncrement: true });

        // Add more object stores for other sections if needed
    };

    // Handle database opening success
    dbRequest.onsuccess = function(event) {
        const db = event.target.result;

        // Event listener for the Save button
        document.getElementById('saveBtn').addEventListener('click', function() {
            const text = document.getElementById('textInput').value;
            const section = document.getElementById('sectionSelect').value;

            // Open a transaction and access the object store for the selected section
            const transaction = db.transaction([section], 'readwrite');
            const objectStore = transaction.objectStore(section);

            // Add the text to the object store
            const newItem = {
                content: text, // Store the entire content as a string
                timestamp: new Date().getTime() // Add a timestamp for sorting if needed
            };
            const request = objectStore.add(newItem);

            // Handle successful data addition
            request.onsuccess = function() {
                alert('Data saved successfully.');
                document.getElementById('textInput').value = ''; // Clear the textarea
                displaySavedData(db);
            };

            // Handle errors
            request.onerror = function() {
                alert('Error saving data.');
            };
        });

        // Display saved data when the page loads
        displaySavedData(db);
    };

    // Handle database opening error
    dbRequest.onerror = function(event) {
        console.error('Database error:', event.target.error);
    };


// Function to display saved data
function displaySavedData(db) {
    const savedDataDiv = document.getElementById('savedData');
    savedDataDiv.innerHTML = ''; // It clear's previous data

    ['section1', 'section2'].forEach(function(sectionName) {
        const transaction = db.transaction([sectionName], 'readonly');
        const objectStore = transaction.objectStore(sectionName);
        const request = objectStore.getAll();

        request.onsuccess = function(event) {
            const data = event.target.result;
            if (data.length > 0) {
                const sectionSummary = document.createElement('div');
                sectionSummary.classList.add('sectionSummary');

                
                const sectionHeader = document.createElement('div');
                sectionHeader.classList.add('sectionHeader');
                sectionHeader.textContent = sectionName.toUpperCase();
                sectionHeader.addEventListener('click', function() {
                    sectionDetails.classList.toggle('collapsed');
                });
                sectionSummary.appendChild(sectionHeader);

                // Create collapsible section details
                const sectionDetails = document.createElement('div');
                sectionDetails.classList.add('sectionDetails', 'collapsed');
                data.forEach(function(item) {
                    const codeElement = document.createElement('code');
                    codeElement.textContent = item.content;
                    const preElement = document.createElement('pre');
                    preElement.appendChild(codeElement);
                    sectionDetails.appendChild(preElement);
                });
                sectionSummary.appendChild(sectionDetails);

                // Create delete button
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Delete ' + sectionName.toUpperCase();
                deleteBtn.addEventListener('click', function() {
                    deleteSection(db, sectionName);
                });
                sectionSummary.appendChild(deleteBtn);

                // Create copy button
                const copyBtn = document.createElement('button');
                copyBtn.textContent = 'Copy ' + sectionName.toUpperCase();
                copyBtn.addEventListener('click', function() {
                    copySectionContent(sectionName);
                });
                sectionSummary.appendChild(copyBtn);

                savedDataDiv.appendChild(sectionSummary);
            }
        };

        request.onerror = function(event) {
            console.error('Error retrieving data:', event.target.error);
        };
    });
}

// Function to delete a section
function deleteSection(db, sectionName) {
    const transaction = db.transaction([sectionName], 'readwrite');
    const objectStore = transaction.objectStore(sectionName);
    const request = objectStore.clear();

    request.onsuccess = function() {
        console.log('Section ' + sectionName + ' deleted successfully.');
        displaySavedData(db);
    };

    request.onerror = function(event) {
        console.error('Error deleting section:', event.target.error);
    };
}

// Function to copy content of a section to clipboard
function copySectionContent(sectionName) {
    const sectionDiv = document.querySelector('.' + sectionName + ' .content');
    const content = sectionDiv.textContent;

    // Create a temporary textarea element to copy the content to clipboard
    const tempTextarea = document.createElement('textarea');
    tempTextarea.value = content;
    document.body.appendChild(tempTextarea);
    tempTextarea.select();
    document.execCommand('copy');
    document.body.removeChild(tempTextarea);

    console.log('Content of ' + sectionName + ' copied to clipboard.');
}