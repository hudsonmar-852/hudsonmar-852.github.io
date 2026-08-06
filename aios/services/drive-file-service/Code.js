'use strict';

var AIOS_DRIVE_CONFIG = Object.freeze({ maxContentBytes: 75000, maxResults: 100, allowedMimeTypes: ['text/plain', 'text/markdown', 'application/json', 'text/csv'] });

function doGet() { return driveJson_({ ok: true, service: 'AIOSDriveFileService', version: '1.0.0' }); }

/**
 * Performs a read-only authorization check for the EO-006 Drive migration.
 * Configure AIOS_COMMUNICATION_FOLDER_ID and AIOS_PENDING_SOURCE_FILE_IDS in
 * Script Properties before running this function from the Apps Script editor.
 * AIOS_PENDING_SOURCE_FILE_IDS must contain exactly five comma-separated IDs.
 */
function testDriveMigrationAuthorization() {
  var properties = PropertiesService.getScriptProperties();
  var rootId = driveRequiredProperty_(properties, 'AIOS_ROOT_FOLDER_ID');
  var communicationId = driveRequiredProperty_(properties, 'AIOS_COMMUNICATION_FOLDER_ID');
  var sourceIds = driveRequiredProperty_(properties, 'AIOS_PENDING_SOURCE_FILE_IDS').split(',').map(function (id) { return id.trim(); }).filter(Boolean);
  if (sourceIds.length !== 5) throw driveError_('INVALID_AUTH_TEST_CONFIG', 'AIOS_PENDING_SOURCE_FILE_IDS must contain exactly five comma-separated file IDs.');

  var report = {
    checkedAt: new Date().toISOString(),
    readOnly: true,
    root: driveAuthorizationFolderCheck_(rootId),
    communication: driveAuthorizationFolderCheck_(communicationId),
    sources: sourceIds.map(driveAuthorizationFileCheck_)
  };
  report.ok = report.root.accessible && report.communication.accessible && report.sources.every(function (source) { return source.accessible; });
  console.log(JSON.stringify(report, null, 2));
  return report;
}

function doPost(e) {
  var requestId = Utilities.getUuid();
  try {
    var request = JSON.parse(e && e.postData && e.postData.contents || '{}');
    var properties = PropertiesService.getScriptProperties();
    var expected = properties.getProperty('DRIVE_FILE_SERVICE_SECRET');
    if (!expected || !driveSecureEquals_(String(request.secret || ''), expected)) throw driveError_('UNAUTHORIZED', 'Authentication failed.');
    var rootId = properties.getProperty('AIOS_ROOT_FOLDER_ID');
    if (!rootId) throw driveError_('SERVER_NOT_CONFIGURED', 'AIOS root is not configured.');
    var context = { rootId: rootId, root: DriveApp.getFolderById(rootId) };
    var result = driveDispatch_(String(request.command || ''), request, context);
    return driveJson_({ ok: true, requestId: requestId, command: request.command, result: result });
  } catch (error) {
    return driveJson_({ ok: false, requestId: requestId, error: { code: error.code || 'INTERNAL_ERROR', message: error.code ? error.message : 'Unexpected service error.' } });
  }
}

function driveRequiredProperty_(properties, name) { var value = String(properties.getProperty(name) || '').trim(); if (!value) throw driveError_('SERVER_NOT_CONFIGURED', name + ' is not configured.'); return value; }
function driveAuthorizationFolderCheck_(id) { try { var folder = DriveApp.getFolderById(id); return { id: id, name: folder.getName(), parents: driveParentMetadata_(folder), accessible: true }; } catch (error) { return { id: id, name: null, parents: [], accessible: false, error: String(error && error.message || error) }; } }
function driveAuthorizationFileCheck_(id) { try { var file = DriveApp.getFileById(id); return { id: id, name: file.getName(), parents: driveParentMetadata_(file), accessible: true }; } catch (error) { return { id: id, name: null, parents: [], accessible: false, error: String(error && error.message || error) }; } }
function driveParentMetadata_(item) { var output = []; var parents = item.getParents(); while (parents.hasNext()) { var parent = parents.next(); output.push({ id: parent.getId(), name: parent.getName() }); } return output; }

function driveDispatch_(command, request, context) {
  switch (command) {
    case 'create': return driveCreate_(request, context);
    case 'read': return driveRead_(request, context);
    case 'update': return driveUpdate_(request, context);
    case 'append': return driveAppend_(request, context);
    case 'rename': return driveRename_(request, context);
    case 'move': return driveMove_(request, context);
    case 'search': return driveSearch_(request, context);
    case 'create_folder': return driveCreateFolder_(request, context);
    case 'list_folder': return driveListFolder_(request, context);
    case 'get_info': return driveMetadata_(driveItem_(request.targetId, context));
    default: throw driveError_('UNSUPPORTED_COMMAND', 'Unsupported command.');
  }
}

function driveCreate_(request, context) {
  var folder = request.folderId ? driveFolder_(request.folderId, context) : context.root;
  var name = driveName_(request.name); var content = driveContent_(request.content); var mime = request.mimeType || 'text/plain';
  if (AIOS_DRIVE_CONFIG.allowedMimeTypes.indexOf(mime) === -1) throw driveError_('UNSUPPORTED_MIME_TYPE', 'MIME type is not allowed.');
  if (folder.getFilesByName(name).hasNext()) throw driveError_('DUPLICATE_NAME', 'A file with that name already exists.');
  return driveMetadata_({ type: 'file', value: folder.createFile(name, content, mime) });
}
function driveRead_(request, context) { var file = driveFile_(request.fileId || request.targetId, context); var result = driveMetadata_({ type: 'file', value: file }); result.content = file.getBlob().getDataAsString('UTF-8'); return result; }
function driveUpdate_(request, context) { var file = driveFile_(request.fileId || request.targetId, context); file.setContent(driveContent_(request.content)); return driveMetadata_({ type: 'file', value: file }); }
function driveAppend_(request, context) { var file = driveFile_(request.fileId || request.targetId, context); var current = file.getBlob().getDataAsString('UTF-8'); file.setContent(driveContent_(current + String(request.content || ''))); return driveMetadata_({ type: 'file', value: file }); }
function driveRename_(request, context) { var item = driveItem_(request.targetId, context); item.value.setName(driveName_(request.name)); return driveMetadata_(item); }
function driveMove_(request, context) { var item = driveItem_(request.targetId, context); if (item.value.getId() === context.rootId) throw driveError_('ROOT_PROTECTED', 'The AIOS root cannot be moved.'); var destination = driveFolder_(request.destinationFolderId, context); item.value.moveTo(destination); return driveMetadata_(item); }
function driveCreateFolder_(request, context) { var parent = request.parentFolderId ? driveFolder_(request.parentFolderId, context) : context.root; var name = driveName_(request.name); if (parent.getFoldersByName(name).hasNext()) throw driveError_('DUPLICATE_NAME', 'A folder with that name already exists.'); return driveMetadata_({ type: 'folder', value: parent.createFolder(name) }); }
function driveListFolder_(request, context) { var folder = request.folderId ? driveFolder_(request.folderId, context) : context.root; var items = []; var folders = folder.getFolders(); while (folders.hasNext() && items.length < AIOS_DRIVE_CONFIG.maxResults) items.push(driveMetadata_({ type: 'folder', value: folders.next() })); var files = folder.getFiles(); while (files.hasNext() && items.length < AIOS_DRIVE_CONFIG.maxResults) items.push(driveMetadata_({ type: 'file', value: files.next() })); return { items: items, truncated: items.length === AIOS_DRIVE_CONFIG.maxResults }; }
function driveSearch_(request, context) { var query = String(request.query || '').trim().toLowerCase(); if (!query) throw driveError_('INVALID_QUERY', 'Search query is required.'); var output = []; driveWalk_(context.root, query, output, 0); return { query: query, matches: output, truncated: output.length === AIOS_DRIVE_CONFIG.maxResults }; }
function driveWalk_(folder, query, output, depth) { if (depth > 20 || output.length >= AIOS_DRIVE_CONFIG.maxResults) return; var files = folder.getFiles(); while (files.hasNext() && output.length < AIOS_DRIVE_CONFIG.maxResults) { var file = files.next(); if (file.getName().toLowerCase().indexOf(query) !== -1) output.push(driveMetadata_({ type: 'file', value: file })); } var folders = folder.getFolders(); while (folders.hasNext() && output.length < AIOS_DRIVE_CONFIG.maxResults) { var child = folders.next(); if (child.getName().toLowerCase().indexOf(query) !== -1) output.push(driveMetadata_({ type: 'folder', value: child })); driveWalk_(child, query, output, depth + 1); } }

function driveFile_(id, context) { var file; try { file = DriveApp.getFileById(String(id || '')); } catch (ignored) { throw driveError_('NOT_FOUND', 'File not found.'); } driveAssertInRoot_(file, context); return file; }
function driveFolder_(id, context) { var folder; try { folder = DriveApp.getFolderById(String(id || '')); } catch (ignored) { throw driveError_('NOT_FOUND', 'Folder not found.'); } if (folder.getId() !== context.rootId) driveAssertInRoot_(folder, context); return folder; }
function driveItem_(id, context) { try { return { type: 'file', value: driveFile_(id, context) }; } catch (fileError) { if (fileError.code === 'OUTSIDE_ROOT') throw fileError; return { type: 'folder', value: driveFolder_(id, context) }; } }
function driveAssertInRoot_(item, context) { var parents = item.getParents(); var queue = []; while (parents.hasNext()) queue.push(parents.next()); var seen = {}; while (queue.length) { var parent = queue.shift(); if (parent.getId() === context.rootId) return; if (seen[parent.getId()]) continue; seen[parent.getId()] = true; var ancestors = parent.getParents(); while (ancestors.hasNext()) queue.push(ancestors.next()); } throw driveError_('OUTSIDE_ROOT', 'Target is outside the AIOS root.'); }
function driveMetadata_(item) { return { id: item.value.getId(), name: item.value.getName(), type: item.type, url: item.value.getUrl(), modifiedAt: item.value.getLastUpdated().toISOString() }; }
function driveName_(value) { var name = String(value || '').trim(); if (!name || name.length > 180 || /[\\/]/.test(name)) throw driveError_('INVALID_NAME', 'Invalid item name.'); return name; }
function driveContent_(value) { var content = String(value === undefined ? '' : value); if (Utilities.newBlob(content).getBytes().length > AIOS_DRIVE_CONFIG.maxContentBytes) throw driveError_('CONTENT_TOO_LARGE', 'Content exceeds service limit.'); return content; }
function driveSecureEquals_(left, right) { if (left.length !== right.length) return false; var mismatch = 0; for (var i = 0; i < left.length; i += 1) mismatch |= left.charCodeAt(i) ^ right.charCodeAt(i); return mismatch === 0; }
function driveError_(code, message) { var error = new Error(message); error.code = code; return error; }
function driveJson_(value) { return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON); }
