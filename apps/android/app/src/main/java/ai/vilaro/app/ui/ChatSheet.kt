package ai.vilaro.app.ui

import androidx.compose.runtime.Composable
import ai.vilaro.app.MainViewModel
import ai.vilaro.app.ui.chat.ChatSheetContent

@Composable
fun ChatSheet(viewModel: MainViewModel) {
  ChatSheetContent(viewModel = viewModel)
}
