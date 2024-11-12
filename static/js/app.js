const URL = "https://static.bc-edx.com/data/dl-1-2/m14/lms/starter/samples.json";


function getSubjectInfo(allData, subjectID) {
  // Filter the data for the object with the desired subject number
  let subjectInfo = allData.filter(element => element.id == subjectID)[0];
  return subjectInfo;
}

// Build the metadata panel
function buildMetadata(subjectID, data) {
  console.log(`buildMetadata: ${subjectID}`);
  let subjectMetaData = getSubjectInfo(data.metadata, subjectID);
  console.log(subjectMetaData);
  // Use d3 to select the panel with id of `#sample-metadata`
  let card = d3.select("#sample-metadata");

  // Use `.html("") to clear any existing metadata
  card.html("");
  // Inside a loop, you will need to use d3 to append new
  // tags for each key-value in the filtered metadata.
  Object.entries(subjectMetaData).forEach(([key, value]) => {
    card.append("h6").text(`${key.toUpperCase()}: ${value}`);
  });
}

// function to build both charts
function buildCharts(subjectID, data) {
  console.log(`buildCharts: ${subjectID}`);
  let subjectSampleData = getSubjectInfo(data.samples, subjectID);
  console.log(subjectSampleData);
  // Get the otu_ids, otu_labels, and sample_values
  let otuIDs = subjectSampleData.otu_ids;
  let otuLabels = subjectSampleData.otu_labels;
  let sampleValues = subjectSampleData.sample_values;

  // Build a Bubble Chart
  let trace1 = {
    x: otuIDs,
    y: sampleValues,
    text: otuLabels,
    mode: 'markers',
    marker: {
      size: sampleValues,
      color: otuIDs,
      colorscale: 'Bluered', 
      showscale: true
    }
  };

  let layout1 = {
    width: 900, 
    height: 500,
    title: "Bacteria Cultures Per Sample",
    xaxis: {
      title: "OTU ID"
    },
    yaxis: {
      title: "Number of Bacteria"
    }
  };

  // Render the Bubble Chart
  let data1 = [trace1];
  Plotly.newPlot('bubble', data1, layout1);

  // For the Bar Chart, map the otu_ids to a list of strings for your yticks
  let otuNames = otuIDs.map(id => "OTU " + id);
  // Slice top 10 highest sample values for bar chart (already sorted in data)
  let sampleValuesSliced = sampleValues.slice(0,10).reverse();
  console.log(sampleValuesSliced);
  let otuNamesSliced = otuNames.slice(0, 10).reverse();
  console.log(otuNamesSliced);
  // Build a Bar Chart
  let trace2 = {
    x: sampleValuesSliced,
    y: otuNamesSliced,
    type: 'bar', 
    orientation: 'h'
  };

  let layout2 = {
    width: 750,
    title: `Top 10 Bacteria Cultures Found in Subject ${subjectID}`,
    xaxis: {
      title: "Number of Bacteria"
    }
  };


    // Render the Bar Chart
  let data2 = [trace2];
  Plotly.newPlot('bar', data2, layout2);

}



// Function for event listener
function optionChanged(newSubjectID) {
  console.log(`optionChanged: ${newSubjectID}`);
  // Build charts and metadata panel each time a new sample is selected
  d3.json(URL).then((data) => {
    buildCharts(newSubjectID, data);
    buildMetadata(newSubjectID, data);
  });
  
}

// Function to run on page load
function init() {
  console.log("init");
  d3.json(URL).then((data) => {
    // Get the names field
    let names = data.names;
    // Use d3 to select the dropdown with id of `#selDataset`
    let selDataset = d3.select("#selDataset");
    // Use the list of sample names to populate the select options
    // Hint: Inside a loop, you will need to use d3 to append a new
    // option for each sample name.
    names.forEach(name => {
      selDataset.append("option").attr("value", name).text(name);
    });

    // Build charts and metadata panel with the first subject
    let firstSubjectID = names[0];
    optionChanged(firstSubjectID);
  });
}

// Initialize the dashboard
init();
