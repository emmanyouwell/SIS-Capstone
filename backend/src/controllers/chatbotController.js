import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Student from '../models/Student.js';
import Enrollment from '../models/Enrollment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load chatbot mapping
const loadChatbotMapping = () => {
  try {
    const mappingPath = path.join(__dirname, '../data/chatbotMapping.json');
    const mappingData = fs.readFileSync(mappingPath, 'utf8');
    return JSON.parse(mappingData);
  } catch (error) {
    console.error('Error loading chatbot mapping:', error);
    return [];
  }
};

/**
 * Renders a template string by replacing placeholders with actual values
 * @param {string} templateString - Template with {{placeholder}} syntax
 * @param {Object} user - User object from req.user
 * @param {Object} extraData - Additional data for placeholders
 * @returns {string} Rendered template
 */
export const renderTemplate = (templateString, user, extraData = {}) => {
  if (!templateString) return '';

  let rendered = templateString;

  // Replace {{name}} with user's full name
  if (user) {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    rendered = rendered.replace(/\{\{name\}\}/g, fullName);
  }

  // Replace other placeholders from extraData
  Object.keys(extraData).forEach((key) => {
    const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    rendered = rendered.replace(placeholder, extraData[key] || '');
  });

  return rendered;
};

/**
 * Runs process queries for specific question IDs that require database lookups
 * @param {Object} mappingEntry - The mapping entry from chatbotMapping.json
 * @param {Object} user - User object from req.user
 * @returns {Promise<Object>} Extra data object with query results
 */
export const runProcessQueries = async (mappingEntry, user) => {
  const extraData = {};

  try {
    // Handle enrollment-status question
    if (mappingEntry.id === 'enrollment-status' && user.role === 'Student') {
      const student = await Student.findOne({ userId: user._id })
        .populate('sectionId', 'sectionName gradeLevel');

      if (student) {
        // Set enrollment status text
        extraData.enrollmentStatus = student.enrollmentStatus ? 'Enrolled' : 'Not Enrolled';

        if (student.enrollmentStatus) {
          // Student is enrolled - get grade level and section
          const gradeLevel = student.gradeLevel || (student.sectionId?.gradeLevel);
          const sectionName = student.sectionId?.sectionName || 'N/A';

          extraData.gradeLevel = gradeLevel ? `Grade ${gradeLevel}` : 'N/A';
          extraData.section = sectionName;

          extraData.enrollmentDetails = `You are successfully enrolled for ${extraData.gradeLevel} in section ${sectionName}. You can access all student features including grades, schedule, and materials.`;
        } else {
          // Student is not enrolled - check latest enrollment record
          const latestEnrollment = await Enrollment.findOne({ studentId: student._id })
            .sort({ dateSubmitted: -1 });

          let enrollmentStatusText = 'not enrolled';
          if (latestEnrollment) {
            enrollmentStatusText = latestEnrollment.status;
          }

          extraData.enrollmentDetails = `You are not currently enrolled. Please complete the enrollment process by navigating to the Enrollment section from the sidebar and submitting the enrollment form. Make sure an enrollment period is active and you meet the eligibility requirements to enroll.`;
        }
      } else {
        extraData.enrollmentStatus = 'Not Enrolled';
        extraData.enrollmentDetails = 'Student record not found. Please contact the administration.';
      }
    }

    // Handle view-schedule question for students
    if (mappingEntry.id === 'view-schedule' && user.role === 'Student') {
      const student = await Student.findOne({ userId: user._id })
        .populate('sectionId', 'sectionName');

      if (student?.sectionId) {
        extraData.section = student.sectionId.sectionName;
      } else {
        extraData.section = 'your assigned section';
      }
    }
  } catch (error) {
    console.error('Error running process queries:', error);
    // Don't throw - return empty extraData to allow template to render with defaults
  }

  return extraData;
};

/**
 * Resolves dynamic response by selecting template and rendering it
 * @param {Object} mappingEntry - The mapping entry from chatbotMapping.json
 * @param {Object} user - User object from req.user
 * @param {Object} extraData - Additional data from process queries
 * @returns {string} Final rendered response
 */
export const resolveDynamicResponse = (mappingEntry, user, extraData = {}) => {
  if (!mappingEntry.template) {
    return 'I apologize, but I could not find an appropriate response for your question.';
  }

  // Determine user role (normalize to lowercase for template lookup)
  const role = user?.role?.toLowerCase() || 'default';

  // Select template based on role, fallback to default
  let template = mappingEntry.template[role] || mappingEntry.template.default;

  if (!template) {
    return 'I apologize, but I could not find an appropriate response for your role.';
  }

  // Render template with user data and extra data
  return renderTemplate(template, user, extraData);
};

/**
 * @desc    Get chatbot answer for a question
 * @route   POST /api/v1/chatbot/answer
 * @access  Private
 */
export const getAnswer = async (req, res) => {
  try {
    const { questionId } = req.body;

    if (!questionId) {
      return res.status(400).json({
        message: 'questionId is required',
      });
    }

    // Load chatbot mapping
    const mapping = loadChatbotMapping();
    const mappingEntry = mapping.find((entry) => entry.id === questionId);

    if (!mappingEntry) {
      return res.status(404).json({
        message: 'I apologize, but I could not find an answer to that question. Please try asking something else or contact support for assistance.',
      });
    }

    // Get authenticated user (should be available from authMiddleware)
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        message: 'Please log in to use the chatbot. Authentication is required to provide personalized responses.',
      });
    }

    let finalResponse = '';

    // Handle dynamic vs static responses
    if (mappingEntry.dynamic) {
      // Run any necessary process queries
      const extraData = await runProcessQueries(mappingEntry, user);

      // Resolve dynamic response
      finalResponse = resolveDynamicResponse(mappingEntry, user, extraData);
    } else {
      // Static response
      finalResponse = mappingEntry.response || 'I apologize, but I could not find an answer to that question.';
    }

    res.json({
      success: true,
      message: finalResponse,
    });
  } catch (error) {
    console.error('Error in chatbot getAnswer:', error);
    res.status(500).json({
      message: 'An error occurred while processing your request. Please try again later.',
    });
  }
};

