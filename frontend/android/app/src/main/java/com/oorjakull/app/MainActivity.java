package com.oorjakull.app;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginHandle;

import ee.forgr.capacitor.social.login.GoogleProvider;
import ee.forgr.capacitor.social.login.ModifiedMainActivityForSocialLoginPlugin;
import ee.forgr.capacitor.social.login.SocialLoginPlugin;

// ModifiedMainActivityForSocialLoginPlugin is VERY VERY important for Google scopes support!
public class MainActivity extends BridgeActivity implements ModifiedMainActivityForSocialLoginPlugin {

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		if (this.bridge != null && this.bridge.getWebView() != null) {
			this.bridge.getWebView().setWebChromeClient(new BridgeWebChromeClient(this.bridge) {
				@Override
				public void onPermissionRequest(final PermissionRequest request) {
					request.grant(request.getResources());
				}
			});
		}
	}

	@Override
	public void onActivityResult(int requestCode, int resultCode, Intent data) {
		super.onActivityResult(requestCode, resultCode, data);

		if (requestCode >= GoogleProvider.REQUEST_AUTHORIZE_GOOGLE_MIN && requestCode < GoogleProvider.REQUEST_AUTHORIZE_GOOGLE_MAX) {
			PluginHandle pluginHandle = getBridge().getPlugin("SocialLogin");
			if (pluginHandle == null) {
				Log.i("Google Activity Result", "SocialLogin plugin handle is null");
				return;
			}
			Plugin plugin = pluginHandle.getInstance();
			if (!(plugin instanceof SocialLoginPlugin)) {
				Log.i("Google Activity Result", "SocialLogin plugin instance is not SocialLoginPlugin");
				return;
			}
			((SocialLoginPlugin) plugin).handleGoogleLoginIntent(requestCode, data);
		}
	}

	// This function will never be called, leave it empty
	@Override
	public void IHaveModifiedTheMainActivityForTheUseWithSocialLoginPlugin() {}
}
