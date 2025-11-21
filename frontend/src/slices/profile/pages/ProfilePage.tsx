/**
 * Profile Page component
 * Tabbed profile page with authentication protection and layout
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { AuthGuard } from '../../../shared/components/guards/AuthGuard';
import { PatientNavbar } from '../../../shared/components/organisms/PatientNavbar';
import { TabNavigation } from '../components/molecules/TabNavigation';
import { BasicInformationTab } from '../components/organisms/BasicInformationTab';
import { PersonalInformationTab } from '../components/organisms/PersonalInformationTab';
import { MedicalInformationTab } from '../components/organisms/MedicalInformationTab';
import { GynecologicalInformationTab } from '../components/organisms/GynecologicalInformationTab';
import { ProfileTab } from '../types';
import { usePersonalPatientInfo } from '../hooks/usePersonalPatientInfo';
import { useUserSubscription } from '../hooks/useUserSubscription';
import { ManagePlanModal } from '../components/molecules/ManagePlanModal';
import { ConfirmationModal } from '../../../shared/components/molecules/ConfirmationModal';
import { LocalStorageService } from '../../../shared/services/local-storage-service';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ProfilePageProps {
  'data-testid'?: string;
}

type ModalStep = 'none' | 'warning' | 'confirmation' | 'success';

export const ProfilePage: React.FC<ProfilePageProps> = ({
  'data-testid': testId
}) => {
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string || 'es';
  const [activeTab, setActiveTab] = useState<ProfileTab>('basic');
  const { personalInfo, refetch: refetchPersonalInfo} = usePersonalPatientInfo();
  const { subscription, refetch: refetchSubscription } = useUserSubscription();

  // Modal states for subscription management and cancellation flow
  const [showManagePlanModal, setShowManagePlanModal] = useState(false);
  const [modalStep, setModalStep] = useState<ModalStep>('none');
  const [isCancelling, setIsCancelling] = useState(false);

  // Listen for profile updates and refresh data
  useEffect(() => {
    const handleProfileUpdate = () => {
      console.log('🔄 ProfilePage: Profile updated, refreshing data...');
      refetchPersonalInfo();
    };

    // Listen for custom event
    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [refetchPersonalInfo]);

  const handleTabChange = (tab: ProfileTab) => {
    setActiveTab(tab);
    // Scroll to top when tab changes for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleManagePlan = () => {
    // Show manage plan modal first
    setShowManagePlanModal(true);
  };

  const handleCancelPlanFromModal = () => {
    // Close manage plan modal and show warning modal
    setShowManagePlanModal(false);
    setModalStep('warning');
  };

  const handleCancelSubscription = async () => {
    setIsCancelling(true);

    try {
      const accessToken = LocalStorageService.getAccessToken();

      const response = await fetch(`${API_BASE_URL}/api/subscriptions/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        // Show success modal
        setModalStep('success');

        // Redirect to home after 5 seconds
        setTimeout(() => {
          router.push(`/${locale}`);
        }, 5000);
      } else {
        console.error('Error cancelling subscription');
        setModalStep('none');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      setModalStep('none');
    } finally {
      setIsCancelling(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return <BasicInformationTab data-testid="profile-basic-tab-content" />;
      case 'personal':
        return <PersonalInformationTab data-testid="profile-personal-tab-content" />;
      case 'medical':
        return <MedicalInformationTab data-testid="profile-medical-tab-content" />;
      case 'gynecological':
        return <GynecologicalInformationTab data-testid="profile-gynecological-tab-content" />;
      default:
        return <BasicInformationTab data-testid="profile-basic-tab-content" />;
    }
  };

  return (
    <AuthGuard requiredUserType="patient">
      <div className="min-h-screen bg-gray-50" data-testid={testId}>
        {/* Patient Navbar with integrated auth and navigation */}
        <PatientNavbar data-testid="profile-navbar" />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-vitalgo-green rounded-lg flex items-center justify-center mr-4">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {t('title')}
                  </h1>
                  <p className="text-gray-600">
                    {t('pageDescription')}
                  </p>
                </div>
              </div>

              {/* Manage Plan Button */}
              <button
                onClick={handleManagePlan}
                className="px-6 py-3 bg-white border-2 border-vitalgo-green text-vitalgo-green rounded-lg font-semibold hover:bg-vitalgo-green hover:text-white transition-colors duration-200 flex items-center gap-2"
                data-testid="manage-plan-button"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {t('managePlan')}
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <TabNavigation
            activeTab={activeTab}
            onTabChange={handleTabChange}
            biologicalSex={personalInfo?.biological_sex}
            data-testid="profile-tab-navigation"
          />

          {/* Tab Content */}
          {renderTabContent()}
        </main>

        {/* Manage Plan Modal */}
        <ManagePlanModal
          isOpen={showManagePlanModal}
          onClose={() => setShowManagePlanModal(false)}
          onCancelPlan={handleCancelPlanFromModal}
          currentSubscription={subscription}
          data-testid="manage-plan-modal"
        />

        {/* Cancellation Modals */}
        {/* Step 1: Warning Modal */}
        <ConfirmationModal
          isOpen={modalStep === 'warning'}
          onClose={() => setModalStep('none')}
          onConfirm={() => setModalStep('confirmation')}
          title={t('cancelSubscription.warning.title')}
          message={t('cancelSubscription.warning.message')}
          confirmText={t('cancelSubscription.warning.confirm')}
          cancelText={tCommon('cancel')}
          type="warning"
          data-testid="cancel-warning-modal"
        />

        {/* Step 2: Confirmation Modal */}
        <ConfirmationModal
          isOpen={modalStep === 'confirmation'}
          onClose={() => setModalStep('none')}
          onConfirm={handleCancelSubscription}
          title={t('cancelSubscription.confirmation.title')}
          message={t('cancelSubscription.confirmation.message')}
          confirmText={isCancelling ? t('cancelSubscription.confirmation.cancelling') : t('cancelSubscription.confirmation.confirm')}
          cancelText={tCommon('cancel')}
          type="danger"
          data-testid="cancel-confirmation-modal"
        />

        {/* Step 3: Success Modal */}
        <ConfirmationModal
          isOpen={modalStep === 'success'}
          onClose={() => setModalStep('none')}
          title={t('cancelSubscription.success.title')}
          message={t('cancelSubscription.success.message')}
          confirmText={t('cancelSubscription.success.understood')}
          type="success"
          showCancel={false}
          data-testid="cancel-success-modal"
        />

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <p className="text-gray-500 text-sm">
                  {t('footer.copyright')}
                </p>
              </div>
              <div className="flex items-center space-x-6">
                <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">
                  {t('footer.privacy')}
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">
                  {t('footer.terms')}
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">
                  {t('footer.support')}
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </AuthGuard>
  );
};