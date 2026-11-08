import SwiftUI

@main
struct PracticeLauncher: App {
    var body: some Scene {
        WindowGroup {
            Text("Response Autonomy isolated Safari QA").onAppear {
                if let raw = ProcessInfo.processInfo.environment["RAT_FIXTURE_URL"], let url = URL(string: raw) {
                    UIApplication.shared.open(url)
                }
            }
        }
    }
}
