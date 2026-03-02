import React, { useState } from 'react';
import { Code, Folder, FileText, Cpu, Terminal, ChevronRight, ChevronDown } from 'lucide-react';

const STRUCTURE = [
  { name: 'CMakeLists.txt', type: 'file', content: 'cmake_minimum_required(VERSION 3.16.0)\ninclude($ENV{IDF_PATH}/tools/cmake/project.cmake)\nproject(ionos)' },
  { name: 'main', type: 'folder', children: [
    { name: 'main.c', type: 'file', content: '#include "ionos.h"\n\nvoid app_main(void) {\n    ionos_init();\n    ionos_start();\n}' },
    { name: 'CMakeLists.txt', type: 'file', content: 'idf_component_register(SRCS "main.c"\n                    INCLUDE_DIRS ".")' }
  ]},
  { name: 'components', type: 'folder', children: [
    { name: 'ionos_core', type: 'folder', children: [
      { name: 'include', type: 'folder', children: [
        { name: 'ionos.h', type: 'file', content: '#ifndef IONOS_H\n#define IONOS_H\n\nvoid ionos_init(void);\nvoid ionos_start(void);\n\n#endif' },
        { name: 'event_bus.h', type: 'file', content: '#ifndef EVENT_BUS_H\n#define EVENT_BUS_H\n\ntypedef enum {\n    EVENT_INPUT,\n    EVENT_POWER,\n    EVENT_WIFI\n} event_type_t;\n\nvoid event_bus_init(void);\nvoid event_bus_post(event_type_t type, void* data);\n\n#endif' }
      ]},
      { name: 'src', type: 'folder', children: [
        { name: 'ionos.c', type: 'file', content: '#include "ionos.h"\n#include "event_bus.h"\n\nvoid ionos_init(void) {\n    event_bus_init();\n    // init hal\n}\n\nvoid ionos_start(void) {\n    // start tasks\n}' },
        { name: 'event_bus.c', type: 'file', content: '#include "event_bus.h"\n#include "freertos/FreeRTOS.h"\n#include "freertos/queue.h"\n\nstatic QueueHandle_t event_queue;\n\nvoid event_bus_init(void) {\n    event_queue = xQueueCreate(32, sizeof(event_type_t));\n}' }
      ]}
    ]},
    { name: 'ionos_ui', type: 'folder', children: [
      { name: 'include', type: 'folder', children: [
        { name: 'ui_manager.h', type: 'file', content: '#ifndef UI_MANAGER_H\n#define UI_MANAGER_H\n\nvoid ui_init(void);\nvoid ui_render(void);\n\n#endif' }
      ]},
      { name: 'src', type: 'folder', children: [
        { name: 'ui_manager.c', type: 'file', content: '#include "ui_manager.h"\n\nvoid ui_init(void) {\n    // init display driver\n}' }
      ]}
    ]},
    { name: 'ionos_services', type: 'folder', children: [
      { name: 'include', type: 'folder', children: [
        { name: 'audio_manager.h', type: 'file', content: '#ifndef AUDIO_MANAGER_H\n#define AUDIO_MANAGER_H\n\nvoid audio_init(void);\nvoid audio_play(const char* path);\n\n#endif' },
        { name: 'power_manager.h', type: 'file', content: '#ifndef POWER_MANAGER_H\n#define POWER_MANAGER_H\n\nvoid power_init(void);\nint power_get_battery_level(void);\n\n#endif' }
      ]}
    ]},
    { name: 'ionos_hal', type: 'folder', children: [
      { name: 'include', type: 'folder', children: [
        { name: 'hal_display.h', type: 'file', content: '#ifndef HAL_DISPLAY_H\n#define HAL_DISPLAY_H\n\nvoid hal_display_init(void);\nvoid hal_display_flush(void);\n\n#endif' },
        { name: 'hal_input.h', type: 'file', content: '#ifndef HAL_INPUT_H\n#define HAL_INPUT_H\n\nvoid hal_input_init(void);\nint hal_input_read(void);\n\n#endif' }
      ]}
    ]}
  ]}
];

const CORE_SERVICES_CODE = `
/**
 * @file ionos_services.c
 * @brief Core system services for ionOS
 */

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_log.h"
#include "event_bus.h"
#include "audio_manager.h"
#include "power_manager.h"
#include "storage_manager.h"
#include "wireless_manager.h"

static const char *TAG = "ionOS_Services";

// Task Handles
TaskHandle_t ui_task_handle = NULL;
TaskHandle_t input_task_handle = NULL;
TaskHandle_t audio_task_handle = NULL;
TaskHandle_t storage_task_handle = NULL;
TaskHandle_t wireless_task_handle = NULL;
TaskHandle_t power_task_handle = NULL;

void system_services_init(void) {
    ESP_LOGI(TAG, "Initializing ionOS System Services...");
    
    // Initialize Event Bus first
    event_bus_init();
    
    // Initialize Managers
    power_manager_init();
    storage_manager_init();
    audio_manager_init();
    wireless_manager_init();
    
    ESP_LOGI(TAG, "System Services Initialized.");
}

void system_services_start(void) {
    ESP_LOGI(TAG, "Starting Service Tasks...");
    
    // Priority-based scheduling (Higher number = higher priority)
    xTaskCreatePinnedToCore(input_task, "Input_Task", 4096, NULL, 5, &input_task_handle, 1);
    xTaskCreatePinnedToCore(audio_task, "Audio_Task", 8192, NULL, 4, &audio_task_handle, 1);
    xTaskCreatePinnedToCore(ui_task, "UI_Task", 8192, NULL, 3, &ui_task_handle, 0);
    xTaskCreatePinnedToCore(wireless_task, "Wireless_Task", 4096, NULL, 2, &wireless_task_handle, 0);
    xTaskCreatePinnedToCore(storage_task, "Storage_Task", 4096, NULL, 2, &storage_task_handle, 0);
    xTaskCreatePinnedToCore(power_task, "Power_Task", 2048, NULL, 1, &power_task_handle, 0);
    
    ESP_LOGI(TAG, "All tasks started successfully.");
}
`;

const UI_FRAMEWORK_CODE = `
/**
 * @file ui_framework.c
 * @brief Lightweight UI framework for ionOS
 */

#include "ui_manager.h"
#include "hal_display.h"
#include "event_bus.h"
#include "esp_log.h"

static const char *TAG = "ionOS_UI";

typedef struct {
    int x, y, width, height;
    uint16_t *framebuffer;
} window_t;

static window_t active_window;
static window_t popup_overlay;

void ui_init(void) {
    ESP_LOGI(TAG, "Initializing UI Framework...");
    hal_display_init();
    
    // Allocate framebuffer in PSRAM
    active_window.width = 240;
    active_window.height = 320;
    active_window.framebuffer = (uint16_t*)heap_caps_malloc(240 * 320 * 2, MALLOC_CAP_SPIRAM);
    
    if (!active_window.framebuffer) {
        ESP_LOGE(TAG, "Failed to allocate framebuffer!");
        return;
    }
    
    ui_render_boot_screen();
}

void ui_render_status_bar(void) {
    // Render persistent top status bar
    // Battery level, Wireless status, Bluetooth status, Time, SD card state
    // ...
}

void ui_task(void *pvParameters) {
    event_t event;
    while(1) {
        // Wait for UI update events
        if (event_bus_receive(EVENT_GROUP_UI, &event, portMAX_DELAY)) {
            switch(event.type) {
                case UI_EVENT_APP_LAUNCH:
                    ui_render_app(event.data);
                    break;
                case UI_EVENT_BATTERY_UPDATE:
                    ui_render_status_bar();
                    break;
                case UI_EVENT_INPUT:
                    ui_handle_input(event.data);
                    break;
            }
            
            // Flush framebuffer to display
            hal_display_flush(active_window.framebuffer);
        }
    }
}
`;

function FileTree({ data, level = 0 }: { data: any[], level?: number }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    'components': true,
    'ionos_core': true,
    'ionos_ui': true,
    'src': true,
    'include': true
  });

  const toggle = (name: string) => {
    setExpanded(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="w-full">
      {data.map((item, index) => (
        <div key={index} className="w-full">
          <div 
            className="flex items-center py-1 hover:bg-zinc-800 cursor-pointer rounded px-2"
            style={{ paddingLeft: `${level * 16 + 8}px` }}
            onClick={() => item.type === 'folder' && toggle(item.name)}
          >
            {item.type === 'folder' ? (
              <div className="flex items-center gap-1.5 text-zinc-300">
                {expanded[item.name] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <Folder size={14} className="text-blue-400" />
                <span>{item.name}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-zinc-400 pl-5">
                <FileText size={14} className="text-zinc-500" />
                <span>{item.name}</span>
              </div>
            )}
          </div>
          {item.type === 'folder' && expanded[item.name] && item.children && (
            <FileTree data={item.children} level={level + 1} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function CodeViewer() {
  const [activeTab, setActiveTab] = useState('structure');

  return (
    <div className="w-full h-full flex flex-col">
      <div className="h-14 border-b border-zinc-800 flex items-center px-6 gap-4 bg-zinc-900 shrink-0">
        <button className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === 'structure' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`} onClick={() => setActiveTab('structure')}>
          <Folder size={16} /> Project Structure
        </button>
        <button className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === 'core' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`} onClick={() => setActiveTab('core')}>
          <Cpu size={16} /> Core Services
        </button>
        <button className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === 'ui' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`} onClick={() => setActiveTab('ui')}>
          <Code size={16} /> UI Framework
        </button>
      </div>
      
      <div className="flex-1 overflow-auto bg-zinc-950 text-zinc-300 font-mono text-sm leading-relaxed p-6">
        {activeTab === 'structure' && (
          <div className="w-full max-w-2xl">
            <div className="text-zinc-500 mb-4 border-b border-zinc-800 pb-2 flex items-center gap-2">
              <Terminal size={16} />
              <span>ESP-IDF Project Layout</span>
            </div>
            <FileTree data={STRUCTURE} />
          </div>
        )}
        
        {activeTab === 'core' && (
          <div className="w-full max-w-3xl">
            <div className="text-zinc-500 mb-4 border-b border-zinc-800 pb-2 flex items-center gap-2">
              <Terminal size={16} />
              <span>components/ionos_services/src/system_services.c</span>
            </div>
            <pre className="text-emerald-400 bg-zinc-900 p-4 rounded-lg overflow-x-auto border border-zinc-800">
              <code>{CORE_SERVICES_CODE.trim()}</code>
            </pre>
          </div>
        )}
        
        {activeTab === 'ui' && (
          <div className="w-full max-w-3xl">
            <div className="text-zinc-500 mb-4 border-b border-zinc-800 pb-2 flex items-center gap-2">
              <Terminal size={16} />
              <span>components/ionos_ui/src/ui_framework.c</span>
            </div>
            <pre className="text-blue-400 bg-zinc-900 p-4 rounded-lg overflow-x-auto border border-zinc-800">
              <code>{UI_FRAMEWORK_CODE.trim()}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
