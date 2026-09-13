mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    // 1. THIS LINE FIXES YOUR DIALOG ERROR:
    .plugin(tauri_plugin_dialog::init())
    
    // 2. THIS LINE REGISTERS YOUR MOCK TEST COMMAND:
    .invoke_handler(tauri::generate_handler![
        commands::file_eraser_cmds::test_mock_file_erasure,
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