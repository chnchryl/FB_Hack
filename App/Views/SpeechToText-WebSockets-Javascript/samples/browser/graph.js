var chart;
window.onload = function () {
	chart = new CanvasJS.Chart("chartContainer", {
		title: {
			text: "No. of sentences VS time"
		},
		data: [
		{
			type: "line",
      connectNullData: true,
			xValueType: "dateTime",
			xValueFormatString: "DD MMM hh:mm TT",
			yValueFormatString: "#,##0.##\"%\"",
			dataPoints: [
				{ x: 1501023673000, y: 0 },
				{ x: 1501027273000, y: 0 },
				{ x: 1501030873000, y: 0 },
				{ x: 1501034473000, y: 0 },
				{ x: 1501038073000, y: 0 },
				{ x: 1501041673000, y: 0 },
				{ x: 1501045073000, y: 0 },
				{ x: 1501048673000, y: 0 },
				{ x: 1501052273000, y: 0 },
				{ x: 1501055873000, y: 0 },
				{ x: 1501063043000, y: 0 },
				{ x: 1501066673000, y: 0 }
			]
		}
		]
	});

	chart.render();
	$("#updateDataPoint").click(updateY);
}

function updateY(hour){
	//var length = chart.options.data[0].dataPoints.length;
	chart.options.title.text = "Last DataPoint Updated";
	chart.options.data[0].dataPoints[hour].y += 1;
	chart.render();
}


//SDK USAGE

		// On document load resolve the SDK dependency
		function Initialize(onComplete) {
				if (!!window.SDK) {
						document.getElementById('content').style.display = 'block';
						document.getElementById('warning').style.display = 'none';
						onComplete(window.SDK);
				}
		}

		// Setup the recognizer
		function RecognizerSetup(SDK, recognitionMode, language, format, subscriptionKey) {

				switch (recognitionMode) {
						case "Interactive" :
								recognitionMode = SDK.RecognitionMode.Interactive;
								break;
						case "Conversation" :
								recognitionMode = SDK.RecognitionMode.Conversation;
								break;
						case "Dictation" :
								recognitionMode = SDK.RecognitionMode.Dictation;
								break;
						default:
								recognitionMode = SDK.RecognitionMode.Interactive;
				}

				var recognizerConfig = new SDK.RecognizerConfig(
						new SDK.SpeechConfig(
								new SDK.Context(
										new SDK.OS(navigator.userAgent, "Browser", null),
										new SDK.Device("SpeechSample", "SpeechSample", "1.0.00000"))),
						recognitionMode,
						language, // Supported languages are specific to each recognition mode. Refer to docs.
						format); // SDK.SpeechResultFormat.Simple (Options - Simple/Detailed)


				var useTokenAuth = false;

				var authentication = function() {
						if (!useTokenAuth)
								return new SDK.CognitiveSubscriptionKeyAuthentication(subscriptionKey);

						var callback = function() {
								var tokenDeferral = new SDK.Deferred();
								try {
										var xhr = new(XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0');
										xhr.open('GET', '/token', 1);
										xhr.onload = function () {
												if (xhr.status === 200)  {
														tokenDeferral.Resolve(xhr.responseText);
												} else {
														tokenDeferral.Reject('Issue token request failed.');
												}
										};
										xhr.send();
								} catch (e) {
										window.console && console.log(e);
										tokenDeferral.Reject(e.message);
								}
								return tokenDeferral.Promise();
						}

						return new SDK.CognitiveTokenAuthentication(callback, callback);
				}();

				var files = document.getElementById('filePicker').files;
				if (!files.length) {
						return SDK.CreateRecognizer(recognizerConfig, authentication);
				} else {
						return SDK.CreateRecognizerWithFileAudioSource(recognizerConfig, authentication, files[0]);
				}
		}

		// Start the recognition
		function RecognizerStart(SDK, recognizer) {
				recognizer.Recognize((event) => {
						/*
						 Alternative syntax for typescript devs.
						 if (event instanceof SDK.RecognitionTriggeredEvent)
						*/
						switch (event.Name) {
								case "RecognitionTriggeredEvent" :
										UpdateStatus("Initializing");
										break;
								case "ListeningStartedEvent" :
										UpdateStatus("Listening");
										break;
								case "RecognitionStartedEvent" :
										UpdateStatus("Listening_Recognizing");
										break;
								case "SpeechStartDetectedEvent" :
										UpdateStatus("Listening_DetectedSpeech_Recognizing");
										console.log(JSON.stringify(event.Result)); // check console for other information in result
										break;
								case "SpeechHypothesisEvent" :
										UpdateRecognizedHypothesis(event.Result.Text, false);
										console.log(JSON.stringify(event.Result)); // check console for other information in result
										break;
								case "SpeechFragmentEvent" :
										UpdateRecognizedHypothesis(event.Result.Text, true);
										console.log(JSON.stringify(event.Result)); // check console for other information in result
										break;
								case "SpeechEndDetectedEvent" :
										OnSpeechEndDetected();
										UpdateStatus("Processing_Adding_Final_Touches");
										console.log(JSON.stringify(event.Result)); // check console for other information in result
										break;
								case "SpeechSimplePhraseEvent" :
										UpdateRecognizedPhrase(JSON.stringify(event.Result, null, 3));
										break;
								case "SpeechDetailedPhraseEvent" :
										UpdateRecognizedPhrase(JSON.stringify(event.Result, null, 3));
										break;
								case "RecognitionEndedEvent" :
										OnComplete();
										UpdateStatus("Idle");
										console.log(JSON.stringify(event)); // Debug information
										break;
								default:
										console.log(JSON.stringify(event)); // Debug information
						}
				})
				.On(() => {
						// The request succeeded. Nothing to do here.
				},
				(error) => {
						console.error(error);
				});
		}

		// Stop the Recognition.
		function RecognizerStop(SDK, recognizer) {
				// recognizer.AudioSource.Detach(audioNodeId) can be also used here. (audioNodeId is part of ListeningStartedEvent)
				recognizer.AudioSource.TurnOff();
		}

//Browser Hooks
		var startBtn, stopBtn, hypothesisDiv, phraseDiv, statusDiv;
		var filePicker;
		var SDK;
		var recognizer;
		var previousSubscriptionKey;

		document.addEventListener("DOMContentLoaded", function () {
				createBtn = document.getElementById("createBtn");
				startBtn = document.getElementById("startBtn");
				stopBtn = document.getElementById("stopBtn");
				phraseDiv = document.getElementById("phraseDiv");
				hypothesisDiv = document.getElementById("hypothesisDiv");
				statusDiv = document.getElementById("statusDiv");
				filePicker = document.getElementById('filePicker');


				startBtn.addEventListener("click", function () {
										previousSubscriptionKey = "65a6065583b344a19019490296847dc3";
										Setup();

								hypothesisDiv.innerHTML = "";
								phraseDiv.innerHTML = "";
								RecognizerStart(SDK, recognizer);
								startBtn.disabled = true;
								stopBtn.disabled = false;
				});

				filePicker.addEventListener("change", function () {
						Setup();
						hypothesisDiv.innerHTML = "";
						phraseDiv.innerHTML = "";
						RecognizerStart(SDK, recognizer);
						startBtn.disabled = true;
						stopBtn.disabled = false;
						filePicker.value = "";
				});

				stopBtn.addEventListener("click", function () {
						RecognizerStop(SDK, recognizer);
						startBtn.disabled = false;
						stopBtn.disabled = true;
				});

				Initialize(function (speechSdk) {
						SDK = speechSdk;
						startBtn.disabled = false;
				});
		});

		function Setup() {
				if (recognizer != null) {
						RecognizerStop(SDK, recognizer);
				}
				recognizer = RecognizerSetup(SDK, "Dictation", "en-GB", SDK.SpeechResultFormat["Simple"], "65a6065583b344a19019490296847dc3");
		}

		function UpdateStatus(status) {
				statusDiv.innerHTML = status;
		}

		function UpdateRecognizedHypothesis(text, append) {
				if (append){
					hypothesisDiv.innerHTML += text + " ";
					var date = new Date().toLocaleString();
					//var hour = date.getHours();
					console.log("hi");
					//increaseYvalue(3);
				}
				else
						hypothesisDiv.innerHTML = text;

				var length = hypothesisDiv.innerHTML.length;
				if (length > 403) {
						hypothesisDiv.innerHTML = "..." + hypothesisDiv.innerHTML.substr(length-400, length);
				}
		}

		function OnSpeechEndDetected() {
				stopBtn.disabled = true;
		}

		function UpdateRecognizedPhrase(json) {
				hypothesisDiv.innerHTML = "";
				phraseDiv.innerHTML += json + "\n";
				var date = new Date();
				var hour = date.getHours();
				date = date.toLocaleString();
				if (JSON.parse(json).DisplayText) {
					dreamtalks.innerHTML +=  date + " " + JSON.parse(json).DisplayText + "\n";
					console.log("hi update");
					updateY(hour);
				}
		}

		function OnComplete() {
				startBtn.disabled = false;
				stopBtn.disabled = true;

/* Send JSON result to backend */
				// try {
				//     var xhr = new(XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0');
				//     xhr.open('POST', phraseDiv.innerHTML, 1);
				//     xhr.send();
				// } catch (e) {
				//     window.console && console.log(e);
				//     tokenDeferral.Reject(e.message);
				// }
				try {
						var xhr = new(XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0');
						xhr.open('POST', phraseDiv.innerHTML, 1);
						xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
						xhr.send(phraseDiv.innerHTML);
				} catch (e) {
						window.console && console.log(e);
						tokenDeferral.Reject(e.message);
				}

		}
