package com.carwash.config;

import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Component
@ConditionalOnProperty(name = "sepay.auto-tunnel", havingValue = "true", matchIfMissing = true)
@Slf4j
public class ServeoTunnelRunner implements CommandLineRunner {

    private Process sshProcess;
    private final ExecutorService executorService = Executors.newSingleThreadExecutor();

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting auto-tunnel using Serveo...");

        executorService.submit(() -> {
            int retries = 0;
            while (retries < 5 && !Thread.currentThread().isInterrupted()) {
                try {
                    ProcessBuilder pb = new ProcessBuilder(
                            "ssh",
                            "-o", "StrictHostKeyChecking=no",
                            "-R", "80:localhost:8080",
                            "serveo.net"
                    );
                    pb.redirectErrorStream(true);
                    sshProcess = pb.start();

                    try (BufferedReader reader = new BufferedReader(new InputStreamReader(sshProcess.getInputStream()))) {
                        String line;
                        while ((line = reader.readLine()) != null) {
                            log.info("[Serveo Tunnel] {}", line);
                            if (line.contains("Forwarding HTTP traffic from") || line.contains("serveousercontent.com")) {
                                String url = "";
                                if (line.contains("https://")) {
                                    url = line.substring(line.indexOf("https://")).trim();
                                } else {
                                    url = line.trim();
                                }
                                log.info("\n=================================================================\n" +
                                         "  SERVEO WEBHOOK TUNNEL ESTABLISHED SUCCESSFULLY!\n" +
                                         "  Your public webhook URL is: \n" +
                                         "  " + url + "/api/payments/sepay-webhook\n" +
                                         "=================================================================\n");
                            }
                        }
                    }

                    int exitCode = sshProcess.waitFor();
                    log.warn("Serveo tunnel process exited with code {}. Retrying in 5 seconds...", exitCode);
                    retries++;
                    Thread.sleep(5000);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    break;
                } catch (Exception e) {
                    log.error("Failed to run Serveo tunnel: {}. Retrying in 5 seconds...", e.getMessage());
                    retries++;
                    try {
                        Thread.sleep(5000);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }
        });
    }

    @PreDestroy
    public void stopTunnel() {
        log.info("Shutting down Serveo tunnel...");
        if (sshProcess != null && sshProcess.isAlive()) {
            sshProcess.destroy();
        }
        executorService.shutdownNow();
    }
}
