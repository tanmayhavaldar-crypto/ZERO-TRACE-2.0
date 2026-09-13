#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::drive_eraser_cmds::run_mock_drive_erasure,
            commands::file_eraser_cmds::test_mock_file_erasure
        ])
        .run(tauri::generate_context!())
        .expect("error while running ForenX Secure Eraser application");
}