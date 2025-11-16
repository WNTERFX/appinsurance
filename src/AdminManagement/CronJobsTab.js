import React from "react";

export default function CronJobsTab({ controller }) {
  return (
    <>
      <div className="admin-controller-header">
        {!controller.isCreatingCron && (
          <button
            onClick={controller.showCreateCronForm}
            className="admin-controller-btn admin-controller-btn-primary"
          >
            Add New Cron Job
          </button>
        )}
        {controller.cronApiKey && (
          <button
            onClick={controller.loadCronJobs}
            className="admin-controller-btn admin-controller-btn-secondary"
            disabled={controller.loadingCron}
            style={{ marginLeft: "10px" }}
          >
            {controller.loadingCron ? "Loading..." : "Refresh Jobs"}
          </button>
        )}
      </div>

      {/* API Key Configuration */}
      {!controller.cronApiKey && (
        <div className="admin-controller-form" style={{ marginBottom: "20px", padding: "20px", background: "#f8f9fa" }}>
          <h3 className="admin-controller-subtitle">Configure Cron-Job.org API</h3>
          <p style={{ marginBottom: "15px", color: "#666" }}>
            Enter your API key from cron-job.org Settings to manage your cron jobs.
          </p>
          <div className="admin-controller-form-group">
            <label className="admin-controller-label">
              API Key:
              <input
                type="password"
                value={controller.cronApiKeyInput}
                onChange={(e) => controller.setCronApiKeyInput(e.target.value)}
                className="admin-controller-input"
                placeholder="Enter your cron-job.org API key"
              />
            </label>
          </div>
          <button
            onClick={controller.saveCronApiKey}
            className="admin-controller-btn admin-controller-btn-primary"
          >
            Save API Key
          </button>
        </div>
      )}

      {controller.cronApiKey && (
        <>
          {/* Create/Edit Form */}
          {controller.isCreatingCron && (
            <form onSubmit={controller.handleCronSubmit} className="admin-controller-form">
              <div className="admin-controller-form-group">
                <label className="admin-controller-label">
                  Job URL:
                  <input
                    type="url"
                    value={controller.cronUrl}
                    onChange={(e) => controller.setCronUrl(e.target.value)}
                    className="admin-controller-input"
                    placeholder="https://example.com/cron-endpoint"
                    required
                  />
                </label>
              </div>

              <div className="admin-controller-form-group">
                <label className="admin-controller-label">
                  Job Title (Optional):
                  <input
                    type="text"
                    value={controller.cronTitle}
                    onChange={(e) => controller.setCronTitle(e.target.value)}
                    className="admin-controller-input"
                    placeholder="e.g., Daily Backup Job"
                  />
                </label>
              </div>

              <div className="admin-controller-form-group">
                <label className="admin-controller-label">
                  <input
                    type="checkbox"
                    checked={controller.cronEnabled}
                    onChange={(e) => controller.setCronEnabled(e.target.checked)}
                    style={{ marginRight: "8px" }}
                  />
                  Enabled
                </label>
              </div>

              <h3 className="admin-controller-subtitle">Schedule Configuration</h3>
              
              <div className="admin-controller-form-group">
                <label className="admin-controller-label">
                  Timezone:
                  <input
                    type="text"
                    value={controller.cronTimezone}
                    onChange={(e) => controller.setCronTimezone(e.target.value)}
                    className="admin-controller-input"
                    placeholder="e.g., UTC, Asia/Manila, America/New_York"
                  />
                </label>
              </div>

              <div className="admin-controller-form-group">
                <label className="admin-controller-label">
                  Minutes (-1 for every minute, or comma-separated values like 0,15,30,45):
                  <input
                    type="text"
                    value={controller.cronMinutes}
                    onChange={(e) => controller.setCronMinutes(e.target.value)}
                    className="admin-controller-input"
                    placeholder="-1 or 0,30"
                  />
                </label>
              </div>

              <div className="admin-controller-form-group">
                <label className="admin-controller-label">
                  Hours (-1 for every hour, or comma-separated values like 9,12,18):
                  <input
                    type="text"
                    value={controller.cronHours}
                    onChange={(e) => controller.setCronHours(e.target.value)}
                    className="admin-controller-input"
                    placeholder="-1 or 9,17"
                  />
                </label>
              </div>

              <div className="admin-controller-form-group">
                <label className="admin-controller-label">
                  Days of Month (-1 for every day, or comma-separated values like 1,15):
                  <input
                    type="text"
                    value={controller.cronMdays}
                    onChange={(e) => controller.setCronMdays(e.target.value)}
                    className="admin-controller-input"
                    placeholder="-1 or 1,15"
                  />
                </label>
              </div>

              <div className="admin-controller-form-group">
                <label className="admin-controller-label">
                  Months (-1 for every month, or comma-separated values like 1,6,12):
                  <input
                    type="text"
                    value={controller.cronMonths}
                    onChange={(e) => controller.setCronMonths(e.target.value)}
                    className="admin-controller-input"
                    placeholder="-1 or 1,6,12"
                  />
                </label>
              </div>

              <div className="admin-controller-form-group">
                <label className="admin-controller-label">
                  Weekdays (-1 for every day, 0=Sun, 1=Mon, etc.):
                  <input
                    type="text"
                    value={controller.cronWdays}
                    onChange={(e) => controller.setCronWdays(e.target.value)}
                    className="admin-controller-input"
                    placeholder="-1 or 1,3,5"
                  />
                </label>
              </div>

              <div className="admin-controller-button-group">
                <button
                  type="submit"
                  className="admin-controller-btn admin-controller-btn-primary"
                  disabled={controller.loadingCron}
                >
                  {controller.loadingCron ? "Saving..." : "Create Job"}
                </button>
                <button
                  type="button"
                  onClick={controller.resetCronForm}
                  className="admin-controller-btn admin-controller-btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Jobs Table */}
          <div className="admin-controller-table-wrapper">
            <h3 className="admin-controller-subtitle">Cron Jobs</h3>
            <table className="admin-controller-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Title</th>
                  <th>URL</th>
                  <th>Job ID</th>
                  <th>Schedule</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {controller.cronJobs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="admin-controller-empty">
                      No cron jobs found. Click "Add New Cron Job" to create one or "Refresh Jobs" to load existing jobs.
                    </td>
                  </tr>
                ) : (
                  controller.cronJobs.map((job) => (
                    <tr key={job.jobId}>
                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            backgroundColor: job.enabled ? "#28a745" : "#6c757d",
                            marginRight: "8px"
                          }}
                        />
                        {job.enabled ? "Active" : "Disabled"}
                      </td>
                      <td><strong>{job.title || "Untitled"}</strong></td>
                      <td style={{ maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {job.url}
                      </td>
                      <td><code>{job.jobId}</code></td>
                      <td style={{ fontSize: "0.85em" }}>
                        {job.schedule ? (
                          <div>
                            <div>TZ: {job.schedule.timezone || "UTC"}</div>
                            <div>Min: {job.schedule.minutes?.join(",") || "-1"}</div>
                            <div>Hr: {job.schedule.hours?.join(",") || "-1"}</div>
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => controller.toggleCronJob(job.jobId, job.enabled)}
                          className={`admin-controller-btn ${
                            job.enabled ? "admin-controller-btn-secondary" : "admin-controller-btn-primary"
                          }`}
                          disabled={controller.loadingCron}
                          style={{ marginRight: "5px" }}
                        >
                          {job.enabled ? "Disable" : "Enable"}
                        </button>
                        {/*<button
                          onClick={() => controller.handleDeleteCron(job.jobId)}
                          className="admin-controller-btn admin-controller-btn-delete"
                          disabled={controller.loadingCron}
                        >
                          Delete
                        </button>*/}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* API Key Management */}
          <div style={{ marginTop: "20px", padding: "15px", background: "#f8f9fa", borderRadius: "4px" }}>
            <button
              onClick={controller.clearCronApiKey}
              className="admin-controller-btn admin-controller-btn-delete"
            >
              Clear API Key
            </button>
            <span style={{ marginLeft: "10px", color: "#666", fontSize: "0.9em" }}>
              API Key is configured and stored
            </span>
          </div>
        </>
      )}
    </>
  );
}