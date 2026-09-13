mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    // 1. THIS LINE FIXES YOUR DIALOG ERROR:
    .plugin(tauri_plugin_dialog::init())
    
    // 2. THIS LINE REGISTERS BOTH YOUR MOCK TEST AND REAL ERASURE COMMAND:
    .invoke_handler(tauri::generate_handler![
        commands::file_eraser_cmds::test_mock_file_erasure,
        commands::file_eraser_cmds::erase_real_file, // <-- NEW REAL COMMAND ADDED HERE
    ])
    
    // 3. THIS SETS UP YOUR LOGGING:
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}