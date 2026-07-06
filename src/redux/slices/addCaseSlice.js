import { createSlice } from "@reduxjs/toolkit";

/**
 * addCaseSlice — legacy Redux slice for the add-case form.
 *
 * NOTE (Stage 2 – Data Model Alignment):
 * The add-case form is now driven entirely by Formik (page.js).
 * The fields below that track files (caseFiles, partiesFiles, employeeFiles,
 * courtFiles) and sub-entities (parties, sessions, executions, JudicialNotices,
 * petition, litigationStages, tasks) are NO LONGER DISPATCHED from the form;
 * Formik's `values` object is the single source of truth at submission time.
 *
 * These Redux actions and initial-state fields are kept to avoid breaking any
 * code that may still read from the store (e.g. case-detail pages), but they
 * should not be written to from the add-case form.
 *
 * @deprecated Write path — use Formik setFieldValue instead of Redux dispatch
 *             for the add-case form. Remove this slice's file/sub-entity
 *             reducers in a future cleanup pass.
 */

// Helper function to ensure deep copy of file objects
const cloneFileObject = (fileObj) => {
	if (!fileObj) return { files: [], filesNames: [] };
	return {
		files: [...(fileObj.files || [])],
		filesNames: [...(fileObj.filesNames || [])]
	};
};

const addCaseSlice = createSlice({
	name: "addCase",
	initialState: {
		branchId: null,
		caseNumber: '',
		fees: '',
		caseStartDate: null,
		caseTypeId: null,
		caseClassificationId: null,
		policeStationId: null,
		publicProsecutionId: null,
		courtId: null,
		lawyerId: null,
		secretaryId: null,
		legalAdvisorId: null,
		legalResearcherId: null,
		counterCaseId: null,
		additionalNote: '',
		topic: '',
		is_important: false,
		is_secret: false,
		is_archived: false,
		caseFiles: {
			files: [],
			filesNames: []
		},
		partiesFiles: {
			files: [],
			filesNames: []
		},
		parties: [],
		sessions: [],
		executions: [],
		JudicialNotices: [],
		petition: [],
		litigationStages: [],
		tasks: [],
		employeeFiles: {
			files: [],
			filesNames: []
		},
		courtFiles: {
			files: [],
			filesNames: []
		},
	},
	reducers: {
		setBranchId: (state, action) => {
			state.branchId = action.payload;
		},
		setCaseNumber: (state, action) => {
			state.caseNumber = action.payload;
		},
		setFees: (state, action) => {
			state.fees = action.payload;
		},
		setCaseStartDate: (state, action) => {
			// Handle both Date objects and ISO strings for serialization
			if (action.payload === null || action.payload === undefined) {
				state.caseStartDate = null;
			} else if (typeof action.payload === 'string') {
				// Already an ISO string
				state.caseStartDate = action.payload;
			} else if (action.payload instanceof Date) {
				// Convert Date object to ISO string
				state.caseStartDate = action.payload.toISOString();
			} else {
				// Fallback for other types
				state.caseStartDate = null;
			}
		},
		setCaseTypeId: (state, action) => {
			state.caseTypeId = action.payload;
		},
		setCaseClassificationId: (state, action) => {
			state.caseClassificationId = action.payload;
		},
		setPoliceStationId: (state, action) => {
			state.policeStationId = action.payload;
		},
		setPublicProsecutionId: (state, action) => {
			state.publicProsecutionId = action.payload;
		},
		setCourtId: (state, action) => {
			state.courtId = action.payload;
		},
		setLawyerId: (state, action) => {
			state.lawyerId = action.payload;
		},
		setSecretaryId: (state, action) => {
			state.secretaryId = action.payload;
		},
		setLegalAdvisorId: (state, action) => {
			state.legalAdvisorId = action.payload;
		},
		setLegalResearcherId: (state, action) => {
			state.legalResearcherId = action.payload;
		},
		setCounterCaseId: (state, action) => {
			state.counterCaseId = action.payload;
		},
		setAdditionalNote: (state, action) => {
			state.additionalNote = action.payload;
		},
		setTopic: (state, action) => {
			state.topic = action.payload;
		},
		setIsImportant: (state, action) => {
			state.is_important = action.payload;
		},
		setIsSecret: (state, action) => {
			state.is_secret = action.payload;
		},
		setIsArchived: (state, action) => {
			state.is_archived = action.payload;
		},
		toggleIsImportant: (state) => {
			state.is_important = !state.is_important;
		},
		toggleIsSecret: (state) => {
			state.is_secret = !state.is_secret;
		},
		toggleIsArchived: (state) => {
			state.is_archived = !state.is_archived;
		},
		setCaseFiles: (state, action) => {
			state.caseFiles = action.payload;
		},
		addCaseFile: (state, action) => {
			const { file, fileName, fileType } = action.payload;
			state.caseFiles.files.push(file);
			state.caseFiles.filesNames.push({ fileName, fileType });
		},
		removeCaseFile: (state, action) => {
			const index = action.payload;
			state.caseFiles.files.splice(index, 1);
			state.caseFiles.filesNames.splice(index, 1);
		},
		clearCaseFiles: (state) => {
			state.caseFiles.files = [];
			state.caseFiles.filesNames = [];
		},
		setPartiesFiles: (state, action) => {
			state.partiesFiles = action.payload;
		},
		addPartiesFile: (state, action) => {
			const { file, fileName, fileType, fileSize, uploadedAt } = action.payload;
			state.partiesFiles.files.push(file);
			state.partiesFiles.filesNames.push({ fileName, fileType, fileSize, uploadedAt });
		},
		removePartiesFile: (state, action) => {
			const index = action.payload;
			state.partiesFiles.files.splice(index, 1);
			state.partiesFiles.filesNames.splice(index, 1);
		},
		clearPartiesFiles: (state) => {
			state.partiesFiles.files = [];
			state.partiesFiles.filesNames = [];
		},
		addTask: (state, action) => {
			const newTask = {
				...action.payload,
				files: [],
				filesNames: []
			};
			state.tasks.push(newTask);
		},
		updateTask: (state, action) => {
			const { taskIndex, taskData } = action.payload;
			if (state.tasks[taskIndex]) {
				state.tasks[taskIndex] = {
					...state.tasks[taskIndex],
					...taskData
				};
			}
		},
		removeTask: (state, action) => {
			const taskIndex = action.payload;
			state.tasks.splice(taskIndex, 1);
		},
		addTaskFile: (state, action) => {
			const { taskIndex, file, fileName, fileType } = action.payload;
			if (state.tasks[taskIndex]) {
				state.tasks[taskIndex].files.push(file);
				state.tasks[taskIndex].filesNames.push({ fileName, fileType });
			}
		},
		removeTaskFile: (state, action) => {
			const { taskIndex, fileIndex } = action.payload;
			if (state.tasks[taskIndex]) {
				state.tasks[taskIndex].files.splice(fileIndex, 1);
				state.tasks[taskIndex].filesNames.splice(fileIndex, 1);
			}
		},
		clearTaskFiles: (state, action) => {
			const taskIndex = action.payload;
			if (state.tasks[taskIndex]) {
				state.tasks[taskIndex].files = [];
				state.tasks[taskIndex].filesNames = [];
			}
		},
		setTasks: (state, action) => {
			state.tasks = action.payload;
		},
		setEmployeeFiles: (state, action) => {
			state.employeeFiles = action.payload;
		},
		addEmployeeFile: (state, action) => {
			const { file, fileName, fileType } = action.payload;
			state.employeeFiles.files.push(file);
			state.employeeFiles.filesNames.push({ fileName, fileType });
		},
		removeEmployeeFile: (state, action) => {
			const index = action.payload;
			state.employeeFiles.files.splice(index, 1);
			state.employeeFiles.filesNames.splice(index, 1);
		},
		clearEmployeeFiles: (state) => {
			state.employeeFiles.files = [];
			state.employeeFiles.filesNames = [];
		},
		// Court file management
		addCourtFile: (state, action) => {
			const { file, fileName, fileType } = action.payload;
			state.courtFiles.files.push(file);
			state.courtFiles.filesNames.push({
				fileName,
				fileType,
				uploadDate: new Date().toISOString()
			});
		},
		removeCourtFile: (state, action) => {
			const index = action.payload;
			state.courtFiles.files.splice(index, 1);
			state.courtFiles.filesNames.splice(index, 1);
		},
		clearCourtFiles: (state) => {
			state.courtFiles.files = [];
			state.courtFiles.filesNames = [];
		},
		addSession: (state, action) => {
			// Helper function to convert date to ISO string
			const convertDateToISO = (date) => {
				if (date === null || date === undefined) return null;
				if (typeof date === 'string') return date;
				if (date instanceof Date) return date.toISOString();
				return null;
			};

			const newSession = {
				...action.payload,
				date: convertDateToISO(action.payload.date),
				files: [],
				filesNames: []
			};
			state.sessions.push(newSession);
		},
		updateSession: (state, action) => {
			const { sessionIndex, sessionData } = action.payload;
			if (state.sessions[sessionIndex]) {
				// Helper function to convert date to ISO string
				const convertDateToISO = (date) => {
					if (date === null || date === undefined) return null;
					if (typeof date === 'string') return date;
					if (date instanceof Date) return date.toISOString();
					return null;
				};

				state.sessions[sessionIndex] = {
					...state.sessions[sessionIndex],
					...sessionData,
					date: sessionData.date !== undefined ? convertDateToISO(sessionData.date) : state.sessions[sessionIndex].date
				};
			}
		},
		removeSession: (state, action) => {
			const sessionIndex = action.payload;
			state.sessions.splice(sessionIndex, 1);
		},
		addSessionFile: (state, action) => {
			const { sessionIndex, file, fileName, fileType } = action.payload;
			if (state.sessions[sessionIndex]) {
				state.sessions[sessionIndex].files.push(file);
				state.sessions[sessionIndex].filesNames.push({ fileName, fileType });
			}
		},
		removeSessionFile: (state, action) => {
			const { sessionIndex, fileIndex } = action.payload;
			if (state.sessions[sessionIndex]) {
				state.sessions[sessionIndex].files.splice(fileIndex, 1);
				state.sessions[sessionIndex].filesNames.splice(fileIndex, 1);
			}
		},
		clearSessionFiles: (state, action) => {
			const sessionIndex = action.payload;
			if (state.sessions[sessionIndex]) {
				state.sessions[sessionIndex].files = [];
				state.sessions[sessionIndex].filesNames = [];
			}
		},
		setSessions: (state, action) => {
			state.sessions = action.payload;
		},
		addExecution: (state, action) => {
			const newExecution = {
				...action.payload,
				files: [],
				filesNames: []
			};
			state.executions.push(newExecution);
		},
		updateExecution: (state, action) => {
			const { executionIndex, executionData } = action.payload;
			if (state.executions[executionIndex]) {
				state.executions[executionIndex] = {
					...state.executions[executionIndex],
					...executionData
				};
			}
		},
		removeExecution: (state, action) => {
			const executionIndex = action.payload;
			state.executions.splice(executionIndex, 1);
		},
		addExecutionFile: (state, action) => {
			const { executionIndex, file, fileName, fileType } = action.payload;
			if (state.executions[executionIndex]) {
				state.executions[executionIndex].files.push(file);
				state.executions[executionIndex].filesNames.push({ fileName, fileType });
			}
		},
		removeExecutionFile: (state, action) => {
			const { executionIndex, fileIndex } = action.payload;
			if (state.executions[executionIndex]) {
				state.executions[executionIndex].files.splice(fileIndex, 1);
				state.executions[executionIndex].filesNames.splice(fileIndex, 1);
			}
		},
		clearExecutionFiles: (state, action) => {
			const executionIndex = action.payload;
			if (state.executions[executionIndex]) {
				state.executions[executionIndex].files = [];
				state.executions[executionIndex].filesNames = [];
			}
		},
		setExecutions: (state, action) => {
			state.executions = action.payload;
		},
		// Judicial Notice management
		addJudicialNotice: (state, action) => {
			const newNotice = {
				...action.payload,
				files: [],
				filesNames: []
			};
			state.JudicialNotices.push(newNotice);
		},
		updateJudicialNotice: (state, action) => {
			const { index, notice } = action.payload;
			if (state.JudicialNotices[index]) {
				// Keep existing files when updating and ensure immutability
				const existingFiles = state.JudicialNotices[index].files || [];
				const existingFilesNames = state.JudicialNotices[index].filesNames || [];
				state.JudicialNotices[index] = {
					...state.JudicialNotices[index],
					...notice,
					files: [...existingFiles],
					filesNames: [...existingFilesNames]
				};
			}
		},
		removeJudicialNotice: (state, action) => {
			const index = action.payload;
			state.JudicialNotices.splice(index, 1);
		},
		addJudicialNoticeFile: (state, action) => {
			const { noticeIndex, file, fileName, fileType } = action.payload;
			if (state.JudicialNotices[noticeIndex]) {
				if (!state.JudicialNotices[noticeIndex].files) {
					state.JudicialNotices[noticeIndex].files = [];
				}
				if (!state.JudicialNotices[noticeIndex].filesNames) {
					state.JudicialNotices[noticeIndex].filesNames = [];
				}
				state.JudicialNotices[noticeIndex].files.push(file);
				state.JudicialNotices[noticeIndex].filesNames.push({
					fileName,
					fileType,
					uploadDate: new Date().toISOString()
				});
			}
		},
		removeJudicialNoticeFile: (state, action) => {
			const { noticeIndex, fileIndex } = action.payload;
			if (state.JudicialNotices[noticeIndex]) {
				state.JudicialNotices[noticeIndex].files.splice(fileIndex, 1);
				state.JudicialNotices[noticeIndex].filesNames.splice(fileIndex, 1);
			}
		},
		clearJudicialNoticeFiles: (state, action) => {
			const noticeIndex = action.payload;
			if (state.JudicialNotices[noticeIndex]) {
				state.JudicialNotices[noticeIndex].files = [];
				state.JudicialNotices[noticeIndex].filesNames = [];
			}
		},
		setJudicialNotices: (state, action) => {
			state.JudicialNotices = action.payload;
		},
		resetCaseForm: (state) => {
			// Reset all fields to initial state with proper immutability
			return {
				branchId: null,
				caseNumber: '',
				fees: '',
				caseStartDate: null,
				caseTypeId: null,
				caseClassificationId: null,
				policeStationId: null,
				publicProsecutionId: null,
				courtId: null,
				lawyerId: null,
				secretaryId: null,
				legalAdvisorId: null,
				legalResearcherId: null,
				counterCaseId: null,
				additionalNote: '',
				topic: '',
				is_important: false,
				is_secret: false,
				is_archived: false,
				caseFiles: cloneFileObject(null),
				partiesFiles: cloneFileObject(null),
				employeeFiles: cloneFileObject(null),
				courtFiles: cloneFileObject(null),
				parties: [],
				sessions: [],
				executions: [],
				JudicialNotices: [],
				petition: [],
				litigationStages: [],
				tasks: []
			};
		},
		updateCaseData: (state, action) => {
			// Update multiple fields at once using spread operator for immutability
			return {
				...state,
				...action.payload
			};
		}
	}
});

export const {
	setBranchId,
	setCaseNumber,
	setFees,
	setCaseStartDate,
	setCaseTypeId,
	setCaseClassificationId,
	setPoliceStationId,
	setPublicProsecutionId,
	setCourtId,
	setLawyerId,
	setSecretaryId,
	setLegalAdvisorId,
	setLegalResearcherId,
	setCounterCaseId,
	setAdditionalNote,
	setTopic,
	setIsImportant,
	setIsSecret,
	setIsArchived,
	toggleIsImportant,
	toggleIsSecret,
	toggleIsArchived,
	setCaseFiles,
	addCaseFile,
	removeCaseFile,
	clearCaseFiles,
	setPartiesFiles,
	addPartiesFile,
	removePartiesFile,
	clearPartiesFiles,
	addTask,
	updateTask,
	removeTask,
	addTaskFile,
	removeTaskFile,
	clearTaskFiles,
	setTasks,
	setEmployeeFiles,
	addEmployeeFile,
	removeEmployeeFile,
	clearEmployeeFiles,
	addCourtFile,
	removeCourtFile,
	clearCourtFiles,
	addSession,
	updateSession,
	removeSession,
	addSessionFile,
	removeSessionFile,
	clearSessionFiles,
	setSessions,
	addExecution,
	updateExecution,
	removeExecution,
	addExecutionFile,
	removeExecutionFile,
	clearExecutionFiles,
	setExecutions,
	addJudicialNotice,
	updateJudicialNotice,
	removeJudicialNotice,
	addJudicialNoticeFile,
	removeJudicialNoticeFile,
	clearJudicialNoticeFiles,
	setJudicialNotices,
	resetCaseForm,
	updateCaseData
} = addCaseSlice.actions;

export default addCaseSlice.reducer;